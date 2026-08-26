<?php

declare(strict_types=1);

namespace App\Modules\AI\Services;

use App\Modules\AI\Contracts\AIProviderInterface;
use App\Modules\Catalog\Models\Product;

/**
 * Class MockAIProvider
 *
 * Deterministic local provider suitable for testing and local environments.
 *
 * @package App\Modules\AI\Services
 */
class MockAIProvider implements AIProviderInterface
{
    public function predict(?string $userId, array $context = [], int $limit = 10): array
    {
        $products = Product::where('status', 'active')
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get();

        $results = [];
        $rank = 1;
        foreach ($products as $product) {
            $score = round(1.0 - ($rank * 0.05), 4);
            $results[] = [
                'product_id' => (string) $product->id,
                'score' => max(0.1, $score),
            ];
            $rank++;
        }

        return $results;
    }

    public function getSimilar(string $productId, int $limit = 10): array
    {
        $product = Product::find($productId);
        if (!$product) {
            return [];
        }

        $query = Product::where('status', 'active')
            ->where('id', '!=', $productId);

        if ($product->category_id) {
            $query->where('category_id', $product->category_id);
        }

        $products = $query->limit($limit)->get();

        $results = [];
        $rank = 1;
        foreach ($products as $p) {
            $score = round(0.95 - ($rank * 0.05), 4);
            $results[] = [
                'product_id' => (string) $p->id,
                'score' => max(0.1, $score),
            ];
            $rank++;
        }

        return $results;
    }

    public function checkHealth(): array
    {
        return [
            'status' => 'healthy',
            'provider' => 'mock',
            'model_version' => 'v1.0-mock',
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
