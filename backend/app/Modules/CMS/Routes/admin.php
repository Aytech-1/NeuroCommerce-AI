<?php

declare(strict_types=1);

use App\Modules\CMS\Controllers\Admin\BannerController;
use App\Modules\CMS\Controllers\Admin\BlogPostController;
use App\Modules\CMS\Controllers\Admin\FaqController;
use App\Modules\CMS\Controllers\Admin\MediaController;
use App\Modules\CMS\Controllers\Admin\PageController;
use App\Modules\CMS\Controllers\Admin\TestimonialController;
use Illuminate\Support\Facades\Route;

// Admin CMS Management Routes
Route::prefix('api/v1/admin')->middleware(['api', 'auth:sanctum'])->group(function () {
    // Pages Management
    Route::get('/pages', [PageController::class, 'index']);
    Route::post('/pages', [PageController::class, 'store']);
    Route::get('/pages/{id}', [PageController::class, 'show']);
    Route::put('/pages/{id}', [PageController::class, 'update']);
    Route::delete('/pages/{id}', [PageController::class, 'destroy']);
    Route::patch('/pages/{id}/publish', [PageController::class, 'publish']);

    // Blog Posts Management
    Route::get('/blog', [BlogPostController::class, 'index']);
    Route::post('/blog', [BlogPostController::class, 'store']);
    Route::get('/blog/{id}', [BlogPostController::class, 'show']);
    Route::put('/blog/{id}', [BlogPostController::class, 'update']);
    Route::delete('/blog/{id}', [BlogPostController::class, 'destroy']);

    // Banners Management
    Route::get('/banners', [BannerController::class, 'index']);
    Route::post('/banners', [BannerController::class, 'store']);
    Route::get('/banners/{id}', [BannerController::class, 'show']);
    Route::put('/banners/{id}', [BannerController::class, 'update']);
    Route::delete('/banners/{id}', [BannerController::class, 'destroy']);

    // FAQs Management
    Route::get('/faqs', [FaqController::class, 'index']);
    Route::post('/faqs', [FaqController::class, 'store']);
    Route::get('/faqs/{id}', [FaqController::class, 'show']);
    Route::put('/faqs/{id}', [FaqController::class, 'update']);
    Route::delete('/faqs/{id}', [FaqController::class, 'destroy']);

    // Testimonials Management
    Route::get('/testimonials', [TestimonialController::class, 'index']);
    Route::post('/testimonials', [TestimonialController::class, 'store']);
    Route::get('/testimonials/{id}', [TestimonialController::class, 'show']);
    Route::put('/testimonials/{id}', [TestimonialController::class, 'update']);
    Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy']);

    // Media Management
    Route::get('/media', [MediaController::class, 'index']);
    Route::post('/media', [MediaController::class, 'store']);
    Route::get('/media/{id}', [MediaController::class, 'show']);
    Route::delete('/media/{id}', [MediaController::class, 'destroy']);
});
