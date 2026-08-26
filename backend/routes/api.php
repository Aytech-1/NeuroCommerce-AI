<?php

declare(strict_types=1);

/**
 * NeuroCommerce AI — Central API Router
 *
 * This file serves as the entry point for all API routes.
 * Module-specific routes are loaded by their respective ServiceProviders.
 *
 * @package NeuroCommerce\Routes
 */

use Illuminate\Support\Facades\Route;
use App\Core\Helpers\ResponseHelper;

/*
|--------------------------------------------------------------------------
| API Health Check
|--------------------------------------------------------------------------
*/
Route::get('/v1/health', function () {
    return ResponseHelper::success([
        'status' => 'healthy',
        'version' => config('neurocommerce.version', '1.0.0'),
        'timestamp' => now()->toIso8601String(),
    ], 'NeuroCommerce AI API is running.');
})->name('api.health');

/*
|--------------------------------------------------------------------------
| API Version Info
|--------------------------------------------------------------------------
*/
Route::get('/v1/version', function () {
    return ResponseHelper::success([
        'name' => config('neurocommerce.name'),
        'version' => config('neurocommerce.version'),
        'laravel' => app()->version(),
        'php' => PHP_VERSION,
    ], 'API version information.');
})->name('api.version');
