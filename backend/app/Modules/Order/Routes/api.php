<?php

declare(strict_types=1);

use App\Modules\Order\Controllers\Api\CheckoutController;
use App\Modules\Order\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Order & Checkout API Routes (Storefront)
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1')->middleware(['api'])->group(function () {
    // Checkout Endpoints
    Route::post('/checkout', [CheckoutController::class, 'process'])
        ->middleware('idempotent.checkout')
        ->name('api.v1.checkout.process');
    Route::post('/checkout/validate', [CheckoutController::class, 'validate'])
        ->name('api.v1.checkout.validate');
    Route::get('/checkout/shipping-rates', [CheckoutController::class, 'shippingRates'])
        ->name('api.v1.checkout.shipping_rates');
    Route::get('/checkout/tax', [CheckoutController::class, 'tax'])
        ->name('api.v1.checkout.tax');

    // Customer Order Endpoints (Authenticated)
    Route::prefix('customer/orders')->middleware(['auth:sanctum'])->group(function () {
        Route::get('/', [OrderController::class, 'index'])->name('api.v1.customer.orders.index');
        Route::get('/{id}', [OrderController::class, 'show'])->name('api.v1.customer.orders.show');
        Route::get('/{id}/items', [OrderController::class, 'items'])->name('api.v1.customer.orders.items');
        Route::get('/{id}/tracking', [OrderController::class, 'tracking'])->name('api.v1.customer.orders.tracking');
        Route::post('/{id}/cancel', [OrderController::class, 'cancel'])->name('api.v1.customer.orders.cancel');
        Route::get('/{id}/invoice', [OrderController::class, 'invoice'])->name('api.v1.customer.orders.invoice');
    });
});
