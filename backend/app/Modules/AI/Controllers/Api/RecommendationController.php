<?php

declare(strict_types=1);

namespace App\Modules\AI\Controllers\Api;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\AI\Resources\AIRecommendationResource;
use App\Modules\AI\Services\RecommendationService;
use App\Modules\Catalog\Resources\ProductResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class RecommendationController
 *
 * @package App\Modules\AI\Controllers\Api
 */
class RecommendationController extends Controller
{
    public function __construct(
        protected readonly RecommendationService $recommendationService
    ) {
    }

    public function personalized(Request $request): JsonResponse
    {
        $userId = $request->user()?->id ? (string) $request->user()->id : null;
        $limit = min(30, max(1, (int) $request->query('limit', 10)));
        $context = (array) $request->query('context', []);

        $products = $this->recommendationService->getPersonalized($userId, $context, $limit);

        return ResponseHelper::success(
            ProductResource::collection($products),
            'Personalized recommendations retrieved successfully.'
        );
    }

    public function trending(Request $request): JsonResponse
    {
        $limit = min(30, max(1, (int) $request->query('limit', 10)));
        $products = $this->recommendationService->getTrending($limit);

        return ResponseHelper::success(
            ProductResource::collection($products),
            'Trending products retrieved successfully.'
        );
    }

    public function similar(Request $request, string $productId): JsonResponse
    {
        $limit = min(30, max(1, (int) $request->query('limit', 10)));
        $products = $this->recommendationService->getSimilar($productId, $limit);

        return ResponseHelper::success(
            ProductResource::collection($products),
            'Similar products retrieved successfully.'
        );
    }

    public function crossSell(Request $request): JsonResponse
    {
        $userId = $request->user()?->id ? (string) $request->user()->id : null;
        $cartProductIds = (array) $request->query('cart_products', []);
        $limit = min(15, max(1, (int) $request->query('limit', 5)));

        $products = $this->recommendationService->getCrossSell($userId, $cartProductIds, $limit);

        return ResponseHelper::success(
            ProductResource::collection($products),
            'Cross-sell recommendations retrieved successfully.'
        );
    }

    public function recentlyViewed(Request $request): JsonResponse
    {
        $userId = $request->user()?->id ? (string) $request->user()->id : null;
        $sessionId = (string) $request->header('X-Session-Id', (string) $request->query('session_id', ''));
        $limit = min(30, max(1, (int) $request->query('limit', 10)));

        $products = $this->recommendationService->getRecentlyViewed($userId, $sessionId ?: null, $limit);

        return ResponseHelper::success(
            ProductResource::collection($products),
            'Recently viewed products retrieved successfully.'
        );
    }

    public function feedback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|uuid',
            'strategy' => 'required|string|in:personalized,content_based,trending,cross_sell,recently_viewed',
            'feedback_type' => 'required|string|in:click,dismiss,like,dislike,purchase',
            'rating' => 'nullable|integer|between:1,5',
        ]);

        $userId = (string) $request->user()->id;

        $feedback = $this->recommendationService->recordFeedback(
            $userId,
            $validated['product_id'],
            $validated['strategy'],
            $validated['feedback_type'],
            $validated['rating'] ?? null
        );

        return ResponseHelper::created([
            'id' => (string) $feedback->id,
        ], 'Feedback recorded successfully.');
    }

    public function history(Request $request): JsonResponse
    {
        $userId = (string) $request->user()->id;
        $limit = min(50, max(1, (int) $request->query('limit', 20)));

        $history = $this->recommendationService->getHistory($userId, $limit);

        return ResponseHelper::success(
            AIRecommendationResource::collection($history),
            'Recommendation history retrieved successfully.'
        );
    }
}
