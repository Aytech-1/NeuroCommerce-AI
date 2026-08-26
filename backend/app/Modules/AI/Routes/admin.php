<?php

declare(strict_types=1);

use App\Modules\AI\Controllers\Admin\AdminAIController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| AI Module — Admin AI Management Routes
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1/admin/ai')->middleware(['api', 'auth:sanctum'])->group(function () {
    Route::get('models', [AdminAIController::class, 'models']);
    Route::get('metrics', [AdminAIController::class, 'metrics']);
    Route::post('retrain', [AdminAIController::class, 'retrain']);
});
