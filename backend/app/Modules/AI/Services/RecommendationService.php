<?php

declare(strict_types=1);

namespace App\Modules\AI\Services;

use App\Modules\AI\Contracts\AIProviderInterface;
use App\Modules\AI\Models\AIBehaviorEvent;
use App\Modules\AI\Models\AIInferenceHistory;
use App\Modules\AI\Models\AIRecommendation;
use App\Modules\Catalog\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Class RecommendationService
 *
 * Recommendation engine orchestrator coordinating strategy execution, caching, hydration, and fallback.
 *
 * @package App\Modules\AI\Services
 */
class RecommendationService
{
    public function __construct(
        protected readonly AIProviderInterface $aiProvider
    ) {
    }

    public function getPersonalized(?string $userId, array $context = [], int $limit = 10): Collection
    {
        if (!$userId) {
            return $this->getTrending($limit);
        }

        $cacheKey = "rec:user:{$userId}:personalized";

        return Cache::remember($cacheKey, 900, function () use ($userId, $context, $limit) {
            $startTime = microtime(true);
            $rawPredictions = $this->aiProvider->predict($userId, $context, $limit);
            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

            // Cold start or timeout fallback
            if (empty($rawPredictions)) {
                return $this->getTrending($limit);
            }

            $productIds = array_column($rawPredictions, 'product_id');
            $products = $this->hydrateProducts($productIds);

            // Record inference telemetry
            AIInferenceHistory::create([
                'user_id' => $userId,
                'model_version' => 'v1.0',
                'input_features' => $context,
                'output_scores' => $rawPredictions,
                'latency_ms' => $latencyMs,
            ]);

            // Save recommendations for history
            $rank = 1;
            foreach ($products as $product) {
                AIRecommendation::create([
                    'user_id' => $userId,
                    'strategy' => 'personalized',
                    'product_id' => (string) $product->id,
                    'score' => 0.95 - ($rank * 0.05),
                    'rank' => $rank,
                    'model_version' => 'v1.0',
                    'context' => $context,
                    'generated_at' => now(),
                    'expires_at' => now()->addMinutes(15),
                ]);
                $rank++;
            }

            return $products;
        });
    }

    public function getTrending(int $limit = 10): Collection
    {
        return Cache::remember("rec:trending:{$limit}", 900, function () use ($limit) {
            return Product::where('status', 'active')
                ->with(['category:id,name', 'brand:id,name'])
                ->orderByDesc('total_sold')
                ->limit($limit)
                ->get();
        });
    }

    public function getSimilar(string $productId, int $limit = 10): Collection
    {
        return Cache::remember("rec:similar:{$productId}:{$limit}", 900, function () use ($productId, $limit) {
            $rawPredictions = $this->aiProvider->getSimilar($productId, $limit);

            if (empty($rawPredictions)) {
                $baseProduct = Product::find($productId);
                if (!$baseProduct) {
                    return collect();
                }

                return Product::where('status', 'active')
                    ->where('id', '!=', $productId)
                    ->where('category_id', $baseProduct->category_id)
                    ->with(['category:id,name', 'brand:id,name'])
                    ->limit($limit)
                    ->get();
            }

            $productIds = array_column($rawPredictions, 'product_id');
            return $this->hydrateProducts($productIds);
        });
    }

    public function getCrossSell(?string $userId, array $cartProductIds = [], int $limit = 5): Collection
    {
        $query = Product::where('status', 'active')
            ->with(['category:id,name', 'brand:id,name']);

        if (!empty($cartProductIds)) {
            $query->whereNotIn('id', $cartProductIds);
        }

        return $query->orderByDesc('avg_rating')->limit($limit)->get();
    }

    public function getRecentlyViewed(?string $userId, ?string $sessionId = null, int $limit = 10): Collection
    {
        $query = AIBehaviorEvent::where('event_type', 'product_view')
            ->whereNotNull('product_id');

        if ($userId) {
            $query->where('user_id', $userId);
        } elseif ($sessionId) {
            $query->where('session_id', $sessionId);
        } else {
            return collect();
        }

        $productIds = $query->latest('created_at')
            ->limit($limit * 2)
            ->pluck('product_id')
            ->unique()
            ->take($limit)
            ->toArray();

        return $this->hydrateProducts($productIds);
    }

    public function recordFeedback(string $userId, string $productId, string $strategy, string $feedbackType, ?int $rating = null): AIBehaviorEvent
    {
        return AIBehaviorEvent::create([
            'user_id' => $userId,
            'session_id' => 'feedback-' . $userId,
            'event_type' => 'review',
            'product_id' => $productId,
            'metadata' => [
                'strategy' => $strategy,
                'feedback_type' => $feedbackType,
                'rating' => $rating,
            ],
        ]);
    }

    public function getHistory(string $userId, int $limit = 20): Collection
    {
        return AIRecommendation::where('user_id', $userId)
            ->with('product:id,name,slug,base_price,status')
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }

    protected function hydrateProducts(array $productIds): Collection
    {
        if (empty($productIds)) {
            return collect();
        }

        return Product::whereIn('id', $productIds)
            ->where('status', 'active')
            ->with(['category:id,name', 'brand:id,name'])
            ->get();
    }
}
