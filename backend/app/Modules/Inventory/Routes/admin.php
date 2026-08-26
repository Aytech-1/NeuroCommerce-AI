<?php

declare(strict_types=1);

use App\Modules\Inventory\Controllers\Admin\InventoryController;
use App\Modules\Inventory\Controllers\Admin\SupplierController;
use App\Modules\Inventory\Controllers\Admin\WarehouseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Inventory Admin API Routes
|--------------------------------------------------------------------------
|
| Handled by Inventory module. All routes protected by Sanctum auth.
|
*/

Route::prefix('api/v1/admin')->middleware(['api', 'auth:sanctum'])->group(function () {
    // Inventory Management
    Route::prefix('inventory')->name('admin.inventory.')->group(function () {
        Route::get('/', [InventoryController::class, 'index'])->name('index');
        Route::get('/low-stock', [InventoryController::class, 'lowStock'])->name('low-stock');
        Route::get('/movements', [InventoryController::class, 'movements'])->name('movements');
        Route::post('/adjust', [InventoryController::class, 'adjust'])->name('adjust');
        Route::post('/transfer', [InventoryController::class, 'transfer'])->name('transfer');
        Route::get('/{id}', [InventoryController::class, 'show'])->name('show');
    });

    // Warehouse Management
    Route::apiResource('warehouses', WarehouseController::class)->names('admin.warehouses');

    // Supplier Management
    Route::apiResource('suppliers', SupplierController::class)->names('admin.suppliers');
});
