<?php

declare(strict_types=1);

use App\Modules\Coupon\Controllers\Admin\CouponController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/admin')->middleware(['api', 'auth:sanctum'])->group(function () {
    Route::get('coupons', [CouponController::class, 'index'])->name('api.v1.admin.coupons.index');
    Route::post('coupons', [CouponController::class, 'store'])->name('api.v1.admin.coupons.store');
    Route::get('coupons/{id}', [CouponController::class, 'show'])->name('api.v1.admin.coupons.show');
    Route::put('coupons/{id}', [CouponController::class, 'update'])->name('api.v1.admin.coupons.update');
    Route::delete('coupons/{id}', [CouponController::class, 'destroy'])->name('api.v1.admin.coupons.destroy');
    Route::get('coupons/{id}/usage', [CouponController::class, 'usage'])->name('api.v1.admin.coupons.usage');
});
