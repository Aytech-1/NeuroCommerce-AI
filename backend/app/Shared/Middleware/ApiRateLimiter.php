<?php

declare(strict_types=1);

namespace App\Shared\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class ApiRateLimiter
 *
 * Redis-backed rate limiter with configurable limits per endpoint.
 *
 * @package App\Shared\Middleware
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
class ApiRateLimiter
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param \Closure(Request): (Response) $next
     * @param int|string $maxAttempts
     * @param int|string $decayMinutes
     * @return Response
     */
    public function handle(Request $request, Closure $next, int|string $maxAttempts = 60, int|string $decayMinutes = 1): Response
    {
        $key = $this->resolveRequestSignature($request);
        
        $maxAttempts = (int) $maxAttempts;
        $decayMinutes = (int) $decayMinutes;

        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $retryAfter = RateLimiter::availableIn($key);
            
            $response = response()->json([
                'success' => false,
                'message' => 'Too Many Attempts.',
                'data'    => null,
                'code'    => 'RATE_LIMIT_EXCEEDED'
            ], Response::HTTP_TOO_MANY_REQUESTS);
            
            $response->headers->add([
                'X-RateLimit-Limit' => $maxAttempts,
                'X-RateLimit-Remaining' => 0,
                'Retry-After' => $retryAfter,
                'X-RateLimit-Reset' => time() + $retryAfter,
            ]);
            
            return $response;
        }

        RateLimiter::hit($key, $decayMinutes * 60);

        $response = $next($request);

        $remaining = RateLimiter::retriesLeft($key, $maxAttempts);

        $response->headers->add([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => $remaining,
        ]);

        return $response;
    }

    /**
     * Resolve request signature for rate limiting.
     *
     * @param Request $request
     * @return string
     */
    protected function resolveRequestSignature(Request $request): string
    {
        if ($user = $request->user()) {
            return (string) $user->getAuthIdentifier();
        }

        return $request->ip() ?? 'unknown-ip';
    }
}
