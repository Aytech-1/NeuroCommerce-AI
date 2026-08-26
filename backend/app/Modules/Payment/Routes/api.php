<?php

declare(strict_types=1);

use App\Modules\Payment\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1')->group(function () {
    Route::post('webhooks/{provider}', [WebhookController::class, 'handle'])->name('api.v1.webhooks.handle');
});
