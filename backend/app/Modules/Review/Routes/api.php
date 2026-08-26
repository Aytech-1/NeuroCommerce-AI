<?php

declare(strict_types=1);

use App\Modules\Review\Controllers\Api\CustomerReviewController;
use App\Modules\Review\Controllers\Api\PublicProductReviewController;
use Illuminate\Support\Facades\Route;

// Public product review listing
Route::prefix('api/v1')->middleware(['api'])->group(function () {
    Route::get('products/{id}/reviews', [PublicProductReviewController::class, 'index']);
});

// Authenticated customer review endpoints
Route::prefix('api/v1')->middleware(['api', 'auth:sanctum'])->group(function () {
    Route::get('customer/reviews', [CustomerReviewController::class, 'index']);
    Route::post('products/{id}/reviews', [CustomerReviewController::class, 'store']);
    Route::put('customer/reviews/{id}', [CustomerReviewController::class, 'update']);
    Route::delete('customer/reviews/{id}', [CustomerReviewController::class, 'destroy']);
    Route::post('reviews/{id}/vote', [CustomerReviewController::class, 'vote']);
});
