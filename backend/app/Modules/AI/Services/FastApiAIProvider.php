<?php

declare(strict_types=1);

namespace App\Modules\AI\Services;

use App\Modules\AI\Contracts\AIProviderInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Class FastApiAIProvider
 *
 * REST client for the external FastAPI PyTorch neural network microservice.
 *
 * @package App\Modules\AI\Services
 */
class FastApiAIProvider implements AIProviderInterface
{
    public function __construct(
        protected readonly string $baseUrl = 'http://localhost:8001',
        protected readonly int $timeoutMs = 150
    ) {
    }

    public function predict(?string $userId, array $context = [], int $limit = 10): array
    {
        try {
            $response = Http::timeout($this->timeoutMs / 1000)
                ->post("{$this->baseUrl}/ai/v1/predict", [
                    'user_id' => $userId,
                    'context' => $context,
                    'limit' => $limit,
                ]);

            if ($response->successful()) {
                return $response->json('data.recommendations', []);
            }
        } catch (\Throwable $e) {
            Log::warning("FastAPI AI prediction failed or timed out: {$e->getMessage()}");
        }

        return [];
    }

    public function getSimilar(string $productId, int $limit = 10): array
    {
        try {
            $response = Http::timeout($this->timeoutMs / 1000)
                ->post("{$this->baseUrl}/ai/v1/similar", [
                    'product_id' => $productId,
                    'limit' => $limit,
                ]);

            if ($response->successful()) {
                return $response->json('data.similar_products', []);
            }
        } catch (\Throwable $e) {
            Log::warning("FastAPI AI similarity search failed or timed out: {$e->getMessage()}");
        }

        return [];
    }

    public function checkHealth(): array
    {
        try {
            $response = Http::timeout(2)->get("{$this->baseUrl}/ai/v1/health");
            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Throwable $e) {
            Log::warning("FastAPI AI health check failed: {$e->getMessage()}");
        }

        return ['status' => 'unreachable', 'provider' => 'fastapi'];
    }
}
