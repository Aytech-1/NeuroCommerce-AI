<?php

declare(strict_types=1);

namespace App\Modules\Order\Middleware;

use App\Core\Helpers\ResponseHelper;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class IdempotentCheckoutMiddleware
 *
 * Enforces 24-hour Redis-backed Idempotency-Key guarantees on checkout endpoints.
 *
 * @package App\Modules\Order\Middleware
 */
class IdempotentCheckoutMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $idempotencyKey = $request->header('Idempotency-Key');

        if (! $idempotencyKey) {
            return $next($request);
        }

        $cacheKey = "idempotency:checkout:{$idempotencyKey}";
        $cached = Cache::get($cacheKey);

        if ($cached) {
            if ($cached['status'] === 'processing') {
                return ResponseHelper::error(
                    message: 'A checkout operation with this Idempotency-Key is currently in progress.',
                    status: 409,
                    code: 'CONCURRENT_IDEMPOTENCY_CONFLICT'
                );
            }

            // Verify payload integrity
            $currentHash = md5((string) json_encode($request->except(['payment_token', 'card_token'])));
            if (isset($cached['payload_hash']) && $cached['payload_hash'] !== $currentHash) {
                return ResponseHelper::error(
                    message: 'Idempotency key was previously used with a different request payload.',
                    status: 422,
                    code: 'IDEMPOTENCY_PAYLOAD_MISMATCH'
                );
            }

            // Return cached response
            return new JsonResponse(
                data: json_decode($cached['response'], true),
                status: (int) ($cached['status_code'] ?? 200)
            );
        }

        // Set lock
        $payloadHash = md5((string) json_encode($request->except(['payment_token', 'card_token'])));
        Cache::put($cacheKey, [
            'status' => 'processing',
            'payload_hash' => $payloadHash,
        ], 86400); // 24 hours

        try {
            /** @var Response $response */
            $response = $next($request);

            if ($response->getStatusCode() >= 200 && $response->getStatusCode() < 300) {
                Cache::put($cacheKey, [
                    'status' => 'completed',
                    'payload_hash' => $payloadHash,
                    'response' => $response->getContent(),
                    'status_code' => $response->getStatusCode(),
                ], 86400);
            } else {
                // If failure, release lock to allow retry
                Cache::forget($cacheKey);
            }

            return $response;
        } catch (\Throwable $e) {
            Cache::forget($cacheKey);
            throw $e;
        }
    }
}
