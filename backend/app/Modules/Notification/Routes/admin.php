<?php

declare(strict_types=1);

use App\Modules\Notification\Controllers\Admin\NotificationBroadcastController;
use App\Modules\Notification\Controllers\Admin\NotificationTemplateController;
use Illuminate\Support\Facades\Route;

// Admin Notification Management Routes (Protected)
Route::prefix('api/v1/admin/notifications')->middleware(['api', 'auth:sanctum'])->group(function () {
    // Template Management
    Route::get('/templates', [NotificationTemplateController::class, 'index']);
    Route::post('/templates', [NotificationTemplateController::class, 'store']);
    Route::get('/templates/{id}', [NotificationTemplateController::class, 'show']);
    Route::put('/templates/{id}', [NotificationTemplateController::class, 'update']);
    Route::delete('/templates/{id}', [NotificationTemplateController::class, 'destroy']);

    // Broadcast Dispatch
    Route::post('/send', [NotificationBroadcastController::class, 'broadcast'])->middleware(['throttle:6,1']);
});
