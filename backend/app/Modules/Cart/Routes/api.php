<?php

declare(strict_types=1);

use App\Modules\Cart\Controllers\Api\CartController;
use App\Modules\Cart\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Cart & Wishlist API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1')->middleware(['api'])->group(function () {
    // Shopping Cart Endpoints (Supports both Authenticated and Guest sessions)
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'show'])->name('api.v1.cart.show');
        Route::post('/items', [CartController::class, 'addItem'])->name('api.v1.cart.items.add');
        Route::put('/items/{id}', [CartController::class, 'updateItem'])->name('api.v1.cart.items.update');
        Route::delete('/items/{id}', [CartController::class, 'removeItem'])->name('api.v1.cart.items.remove');
        Route::delete('/', [CartController::class, 'clear'])->name('api.v1.cart.clear');
        Route::post('/coupon', [CartController::class, 'applyCoupon'])->name('api.v1.cart.coupon.apply');
        Route::delete('/coupon', [CartController::class, 'removeCoupon'])->name('api.v1.cart.coupon.remove');
        Route::get('/summary', [CartController::class, 'summary'])->name('api.v1.cart.summary');
    });

    // Customer Wishlist Endpoints (Protected by Sanctum)
    Route::prefix('customer/wishlist')->middleware(['auth:sanctum'])->group(function () {
        Route::get('/', [WishlistController::class, 'index'])->name('api.v1.customer.wishlist.index');
        Route::post('/', [WishlistController::class, 'store'])->name('api.v1.customer.wishlist.store');
        Route::delete('/{productId}', [WishlistController::class, 'destroy'])->name('api.v1.customer.wishlist.destroy');
        Route::post('/{productId}/move-to-cart', [WishlistController::class, 'moveToCart'])->name('api.v1.customer.wishlist.move_to_cart');
        Route::get('/check/{productId}', [WishlistController::class, 'check'])->name('api.v1.customer.wishlist.check');
    });
});
