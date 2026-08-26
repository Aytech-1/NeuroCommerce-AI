<?php

declare(strict_types=1);

use App\Modules\Auth\Controllers\Api\AddressController;
use App\Modules\Auth\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Authentication Routes
|--------------------------------------------------------------------------
*/
Route::prefix('api/v1/auth')->middleware(['api'])->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('auth.forgot-password');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('auth.reset-password');
    Route::post('/verify-email', [AuthController::class, 'verifyEmail'])->name('auth.verify-email');
    Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('verification.verify');
});

/*
|--------------------------------------------------------------------------
| Authenticated Customer Routes
|--------------------------------------------------------------------------
*/
Route::prefix('api/v1/auth')->middleware(['api', 'auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::post('/refresh-token', [AuthController::class, 'refreshToken'])->name('auth.refresh-token');
    Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
    Route::put('/me', [AuthController::class, 'updateProfile'])->name('auth.me.update');
    Route::post('/change-password', [AuthController::class, 'changePassword'])->name('auth.change-password');
    Route::put('/change-password', [AuthController::class, 'changePassword'])->name('auth.change-password.put');
    Route::post('/resend-verification', [AuthController::class, 'resendVerification'])->name('auth.resend-verification');
    Route::get('/sessions', [AuthController::class, 'sessions'])->name('auth.sessions');
    Route::delete('/sessions/{id}', [AuthController::class, 'revokeSession'])->name('auth.sessions.revoke');
});

/*
|--------------------------------------------------------------------------
| Authenticated Address Routes
|--------------------------------------------------------------------------
*/
Route::prefix('api/v1/addresses')->middleware(['api', 'auth:sanctum'])->group(function () {
    Route::get('/', [AddressController::class, 'index'])->name('addresses.index');
    Route::post('/', [AddressController::class, 'store'])->name('addresses.store');
    Route::get('/{id}', [AddressController::class, 'show'])->name('addresses.show');
    Route::put('/{id}', [AddressController::class, 'update'])->name('addresses.update');
    Route::delete('/{id}', [AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::post('/{id}/default', [AddressController::class, 'setDefault'])->name('addresses.default.post');
    Route::patch('/{id}/default', [AddressController::class, 'setDefault'])->name('addresses.default.patch');
});
