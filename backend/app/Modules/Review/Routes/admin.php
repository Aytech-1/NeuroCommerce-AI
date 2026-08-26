<?php

declare(strict_types=1);

use App\Modules\Review\Controllers\Admin\ReviewController;
use Illuminate\Support\Facades\Route;

// Admin review management & moderation routes
Route::prefix('api/v1/admin')->middleware(['api', 'auth:sanctum'])->group(function () {
    Route::get('reviews', [ReviewController::class, 'index']);
    Route::patch('reviews/{id}/approve', [ReviewController::class, 'approve']);
    Route::patch('reviews/{id}/reject', [ReviewController::class, 'reject']);
    Route::patch('reviews/{id}/feature', [ReviewController::class, 'feature']);
    Route::post('reviews/{id}/reply', [ReviewController::class, 'reply']);
    Route::delete('reviews/{id}', [ReviewController::class, 'destroy']);
});
