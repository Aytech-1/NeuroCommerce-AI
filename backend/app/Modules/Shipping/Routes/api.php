<?php

declare(strict_types=1);

use App\Modules\Shipping\Controllers\Api\ShippingController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1')->middleware(['api'])->group(function () {
    // Public/Checkout rate estimation
    Route::post('checkout/shipping-rates', [ShippingController::class, 'calculateRates'])
        ->name('api.v1.checkout.shipping-rates');
    Route::get('checkout/shipping-rates', [ShippingController::class, 'calculateRates'])
        ->name('api.v1.checkout.shipping-rates.get');

    // Customer order tracking (authenticated)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::get('customer/orders/{id}/tracking', [ShippingController::class, 'trackOrder'])
            ->name('api.v1.customer.orders.tracking');
    });
});
