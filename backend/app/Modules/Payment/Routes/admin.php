<?php

declare(strict_types=1);

use App\Modules\Payment\Controllers\Admin\PaymentController;
use App\Modules\Payment\Controllers\Admin\RefundController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/admin')->middleware(['api', 'auth:sanctum'])->group(function () {
    // Payments
    Route::get('payments', [PaymentController::class, 'index'])
        ->middleware('permission:payment.view')
        ->name('api.v1.admin.payments.index');

    Route::get('payments/{id}', [PaymentController::class, 'show'])
        ->middleware('permission:payment.view')
        ->name('api.v1.admin.payments.show');

    Route::post('payments/{id}/refund', [PaymentController::class, 'refund'])
        ->middleware('permission:payment.refund')
        ->name('api.v1.admin.payments.refund');

    // Refunds
    Route::get('refunds', [RefundController::class, 'index'])
        ->middleware('permission:payment.view')
        ->name('api.v1.admin.refunds.index');

    Route::get('refunds/{id}', [RefundController::class, 'show'])
        ->middleware('permission:payment.view')
        ->name('api.v1.admin.refunds.show');
});
