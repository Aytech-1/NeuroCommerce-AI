<?php

declare(strict_types=1);

use App\Modules\AI\Controllers\Api\RecommendationController;
use App\Modules\AI\Controllers\Api\TrackingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AI Module — Tracking & Recommendation API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1')->middleware(['api'])->group(function () {
    // 7.1 Behavior Tracking
    Route::prefix('tracking')->group(function () {
        Route::post('events', [TrackingController::class, 'trackEvent']);
        Route::post('events/batch', [TrackingController::class, 'trackBatch']);
        Route::post('page-view', [TrackingController::class, 'trackPageView']);
        Route::post('product-view', [TrackingController::class, 'trackProductView']);
        Route::post('search', [TrackingController::class, 'trackSearch']);
    });

    // 7.2 Recommendations (Public & Auth routes)
    Route::prefix('recommendations')->group(function () {
        Route::get('trending', [RecommendationController::class, 'trending']);
        Route::get('similar/{productId}', [RecommendationController::class, 'similar']);
        Route::get('cross-sell', [RecommendationController::class, 'crossSell']);
        Route::get('recently-viewed', [RecommendationController::class, 'recentlyViewed']);

        Route::middleware(['auth:sanctum'])->group(function () {
            Route::get('personalized', [RecommendationController::class, 'personalized']);
            Route::post('feedback', [RecommendationController::class, 'feedback']);
            Route::get('history', [RecommendationController::class, 'history']);
        });
    });
});
