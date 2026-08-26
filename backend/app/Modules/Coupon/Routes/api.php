<?php

declare(strict_types=1);

use App\Modules\Coupon\Controllers\Api\CouponController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1')->middleware(['api'])->group(function () {
    // Coupon Validation & Preview
    Route::post('coupons/validate', [CouponController::class, 'validateCoupon'])->name('api.v1.coupons.validate');
    Route::get('coupons/validate', [CouponController::class, 'validateCoupon'])->name('api.v1.coupons.validate.get');

    // Cart Coupon Mutation
    Route::post('cart/coupon', [CouponController::class, 'applyToCart'])->name('api.v1.cart.coupon.apply');
    Route::delete('cart/coupon', [CouponController::class, 'removeFromCart'])->name('api.v1.cart.coupon.remove');
});
