<?php

declare(strict_types=1);

use App\Modules\Catalog\Controllers\Admin\AttributeController;
use App\Modules\Catalog\Controllers\Admin\BrandController;
use App\Modules\Catalog\Controllers\Admin\CategoryController;
use App\Modules\Catalog\Controllers\Admin\ProductController;
use Illuminate\Support\Facades\Route;

// Admin Catalog Management APIs
Route::prefix('api/v1/admin')->middleware(['api', 'auth:sanctum'])->group(function () {
    // Product Management
    Route::get('/products', [ProductController::class, 'index'])->name('admin.products.index');
    Route::post('/products', [ProductController::class, 'store'])->name('admin.products.store');
    Route::get('/products/{id}', [ProductController::class, 'show'])->name('admin.products.show');
    Route::put('/products/{id}', [ProductController::class, 'update'])->name('admin.products.update');
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('admin.products.destroy');
    Route::post('/products/{id}/restore', [ProductController::class, 'restore'])->name('admin.products.restore');
    Route::patch('/products/{id}/status', [ProductController::class, 'updateStatus'])->name('admin.products.status');

    // Product Images
    Route::post('/products/{id}/images', [ProductController::class, 'uploadImages'])->name('admin.products.images.upload');
    Route::put('/products/{id}/images/reorder', [ProductController::class, 'reorderImages'])->name('admin.products.images.reorder');
    Route::delete('/products/{id}/images/{imageId}', [ProductController::class, 'deleteImage'])->name('admin.products.images.delete');

    // Product Variants
    Route::post('/products/{id}/variants', [ProductController::class, 'storeVariant'])->name('admin.products.variants.store');
    Route::put('/products/{id}/variants/{variantId}', [ProductController::class, 'updateVariant'])->name('admin.products.variants.update');
    Route::delete('/products/{id}/variants/{variantId}', [ProductController::class, 'deleteVariant'])->name('admin.products.variants.delete');

    // Category Management
    Route::get('/categories', [CategoryController::class, 'index'])->name('admin.categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('admin.categories.store');
    Route::put('/categories/reorder', [CategoryController::class, 'reorder'])->name('admin.categories.reorder');
    Route::put('/categories/{id}', [CategoryController::class, 'update'])->name('admin.categories.update');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])->name('admin.categories.destroy');

    // Brand Management
    Route::get('/brands', [BrandController::class, 'index'])->name('admin.brands.index');
    Route::post('/brands', [BrandController::class, 'store'])->name('admin.brands.store');
    Route::put('/brands/{id}', [BrandController::class, 'update'])->name('admin.brands.update');
    Route::delete('/brands/{id}', [BrandController::class, 'destroy'])->name('admin.brands.destroy');

    // Attribute Management
    Route::get('/attributes', [AttributeController::class, 'index'])->name('admin.attributes.index');
    Route::post('/attributes', [AttributeController::class, 'store'])->name('admin.attributes.store');
    Route::put('/attributes/{id}', [AttributeController::class, 'update'])->name('admin.attributes.update');
    Route::delete('/attributes/{id}', [AttributeController::class, 'destroy'])->name('admin.attributes.destroy');
    Route::post('/attributes/{id}/values', [AttributeController::class, 'storeValue'])->name('admin.attributes.values.store');
    Route::put('/attributes/{id}/values/{valueId}', [AttributeController::class, 'updateValue'])->name('admin.attributes.values.update');
    Route::delete('/attributes/{id}/values/{valueId}', [AttributeController::class, 'deleteValue'])->name('admin.attributes.values.delete');
});
