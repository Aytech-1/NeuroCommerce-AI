<?php

declare(strict_types=1);

use App\Modules\Notification\Controllers\Api\CustomerNotificationController;
use Illuminate\Support\Facades\Route;

// Customer Notification Routes (Protected)
Route::prefix('api/v1/notifications')->middleware(['api', 'auth:sanctum'])->group(function () {
    Route::get('/', [CustomerNotificationController::class, 'index']);
    Route::get('/unread-count', [CustomerNotificationController::class, 'unreadCount'])->middleware(['throttle:60,1']);
    Route::patch('/{id}/read', [CustomerNotificationController::class, 'markAsRead']);
    Route::post('/mark-all-read', [CustomerNotificationController::class, 'markAllAsRead']);
    Route::delete('/{id}', [CustomerNotificationController::class, 'destroy']);
    Route::get('/preferences', [CustomerNotificationController::class, 'getPreferences']);
    Route::put('/preferences', [CustomerNotificationController::class, 'updatePreferences'])->middleware(['throttle:30,1']);
});
