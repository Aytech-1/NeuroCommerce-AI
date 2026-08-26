<?php

declare(strict_types=1);

use App\Modules\Catalog\Controllers\Api\BrandController;
use App\Modules\Catalog\Controllers\Api\CategoryController;
use App\Modules\Catalog\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

// Public Storefront Catalog APIs
Route::prefix('api/v1')->middleware(['api'])->group(function () {
    // Products
    Route::get('/products', [ProductController::class, 'index'])->name('api.v1.products.index');
    Route::get('/products/featured', [ProductController::class, 'featured'])->name('api.v1.products.featured');
    Route::get('/products/latest', [ProductController::class, 'latest'])->name('api.v1.products.latest');
    Route::get('/products/popular', [ProductController::class, 'popular'])->name('api.v1.products.popular');
    Route::get('/products/deals', [ProductController::class, 'deals'])->name('api.v1.products.deals');
    Route::get('/products/{slug}', [ProductController::class, 'show'])->name('api.v1.products.show');

    // Search
    Route::get('/search', [ProductController::class, 'search'])->name('api.v1.search.index');
    Route::get('/search/suggestions', [ProductController::class, 'suggestions'])->name('api.v1.search.suggestions');

    // Categories
    Route::get('/categories', [CategoryController::class, 'index'])->name('api.v1.categories.index');
    Route::get('/categories/{slug}', [CategoryController::class, 'show'])->name('api.v1.categories.show');
    Route::get('/categories/{slug}/products', [CategoryController::class, 'products'])->name('api.v1.categories.products');

    // Brands
    Route::get('/brands', [BrandController::class, 'index'])->name('api.v1.brands.index');
    Route::get('/brands/{slug}', [BrandController::class, 'show'])->name('api.v1.brands.show');
    Route::get('/brands/{slug}/products', [BrandController::class, 'products'])->name('api.v1.brands.products');
});
