<?php

declare(strict_types=1);

use App\Modules\CMS\Controllers\Api\PublicBlogController;
use App\Modules\CMS\Controllers\Api\PublicCmsController;
use App\Modules\CMS\Controllers\Api\PublicPageController;
use Illuminate\Support\Facades\Route;

// Public Static Pages Routes
Route::prefix('api/v1/pages')->middleware(['api'])->group(function () {
    Route::get('/', [PublicPageController::class, 'index']);
    Route::get('/{slug}', [PublicPageController::class, 'show']);
});

// Public CMS Dynamic Content Routes
Route::prefix('api/v1/cms')->middleware(['api'])->group(function () {
    Route::get('/homepage', [PublicCmsController::class, 'homepage']);
    Route::get('/banners', [PublicCmsController::class, 'banners']);
    Route::get('/faqs', [PublicCmsController::class, 'faqs']);
    Route::get('/testimonials', [PublicCmsController::class, 'testimonials']);
    Route::post('/contact', [PublicCmsController::class, 'contact'])->middleware(['throttle:6,1']);
    Route::get('/navigation', [PublicCmsController::class, 'navigation']);
    Route::get('/blog', [PublicBlogController::class, 'index']);
    Route::get('/blog/{slug}', [PublicBlogController::class, 'show']);
});
