<?php

declare(strict_types=1);

use App\Modules\Order\Controllers\Admin\OrderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Order Admin API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1/admin/orders')->middleware(['api', 'auth:sanctum'])->group(function () {
    Route::get('/', [OrderController::class, 'index'])
        ->middleware('permission:order.view')
        ->name('api.v1.admin.orders.index');
    Route::get('/{id}', [OrderController::class, 'show'])
        ->middleware('permission:order.view')
        ->name('api.v1.admin.orders.show');
    Route::patch('/{id}/status', [OrderController::class, 'updateStatus'])
        ->middleware('permission:order.update')
        ->name('api.v1.admin.orders.update_status');
    Route::post('/{id}/notes', [OrderController::class, 'addNotes'])
        ->middleware('permission:order.update')
        ->name('api.v1.admin.orders.add_notes');
    Route::get('/{id}/timeline', [OrderController::class, 'timeline'])
        ->middleware('permission:order.view')
        ->name('api.v1.admin.orders.timeline');
});

Route::prefix('api/v1/admin/invoices')->middleware(['api', 'auth:sanctum'])->group(function () {
    Route::get('/', [\App\Modules\Order\Controllers\Admin\InvoiceController::class, 'index'])
        ->middleware('permission:order.view')
        ->name('api.v1.admin.invoices.index');
    Route::get('/{id}', [\App\Modules\Order\Controllers\Admin\InvoiceController::class, 'show'])
        ->middleware('permission:order.view')
        ->name('api.v1.admin.invoices.show');
});
