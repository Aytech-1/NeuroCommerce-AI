<?php

declare(strict_types=1);

use App\Modules\Auth\Controllers\Admin\RoleController;
use App\Modules\Auth\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin User & Role Management Routes
|--------------------------------------------------------------------------
*/
Route::prefix('api/v1/admin')->middleware(['api', 'auth:sanctum'])->group(function () {
    // User Management
    Route::prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('admin.users.index');
        Route::post('/', [UserController::class, 'store'])->name('admin.users.store');
        Route::get('/{id}', [UserController::class, 'show'])->name('admin.users.show');
        Route::put('/{id}', [UserController::class, 'update'])->name('admin.users.update');
        Route::delete('/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');
        Route::post('/{id}/restore', [UserController::class, 'restore'])->name('admin.users.restore');
        Route::patch('/{id}/status', [UserController::class, 'updateStatus'])->name('admin.users.status');
        Route::post('/{id}/roles', [UserController::class, 'assignRoles'])->name('admin.users.roles.assign');
        Route::delete('/{id}/roles/{role}', [UserController::class, 'removeRole'])->name('admin.users.roles.remove');
    });

    // Role & Permission Management
    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index'])->name('admin.roles.index');
        Route::post('/', [RoleController::class, 'store'])->name('admin.roles.store');
        Route::get('/{id}', [RoleController::class, 'show'])->name('admin.roles.show');
        Route::put('/{id}', [RoleController::class, 'update'])->name('admin.roles.update');
        Route::delete('/{id}', [RoleController::class, 'destroy'])->name('admin.roles.destroy');
        Route::put('/{id}/permissions', [RoleController::class, 'syncPermissions'])->name('admin.roles.permissions.sync');
    });

    Route::get('/permissions', [RoleController::class, 'permissions'])->name('admin.permissions.index');
});
