<?php

declare(strict_types=1);

use App\Modules\Shipping\Controllers\Admin\ShipmentController;
use App\Modules\Shipping\Controllers\Admin\ShippingMethodController;
use App\Modules\Shipping\Controllers\Admin\ShippingZoneController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/v1/admin')->middleware(['api', 'auth:sanctum'])->group(function () {
    // Shipping Methods / Rates
    Route::get('shipping-methods', [ShippingMethodController::class, 'index'])
        ->middleware('permission:shipping.view')
        ->name('api.v1.admin.shipping-methods.index');

    Route::post('shipping-methods', [ShippingMethodController::class, 'store'])
        ->middleware('permission:shipping.create')
        ->name('api.v1.admin.shipping-methods.store');

    Route::get('shipping-methods/{id}', [ShippingMethodController::class, 'show'])
        ->middleware('permission:shipping.view')
        ->name('api.v1.admin.shipping-methods.show');

    Route::put('shipping-methods/{id}', [ShippingMethodController::class, 'update'])
        ->middleware('permission:shipping.update')
        ->name('api.v1.admin.shipping-methods.update');

    // Shipping Zones
    Route::get('shipping-zones', [ShippingZoneController::class, 'index'])
        ->middleware('permission:shipping.view')
        ->name('api.v1.admin.shipping-zones.index');

    Route::post('shipping-zones', [ShippingZoneController::class, 'store'])
        ->middleware('permission:shipping.create')
        ->name('api.v1.admin.shipping-zones.store');

    Route::get('shipping-zones/{id}', [ShippingZoneController::class, 'show'])
        ->middleware('permission:shipping.view')
        ->name('api.v1.admin.shipping-zones.show');

    Route::put('shipping-zones/{id}', [ShippingZoneController::class, 'update'])
        ->middleware('permission:shipping.update')
        ->name('api.v1.admin.shipping-zones.update');

    // Shipments
    Route::get('shipments', [ShipmentController::class, 'index'])
        ->middleware('permission:shipping.view')
        ->name('api.v1.admin.shipments.index');

    Route::get('shipments/{id}', [ShipmentController::class, 'show'])
        ->middleware('permission:shipping.view')
        ->name('api.v1.admin.shipments.show');

    Route::post('orders/{id}/shipment', [ShipmentController::class, 'createForOrder'])
        ->middleware('permission:shipping.create')
        ->name('api.v1.admin.orders.shipment.create');

    Route::patch('shipments/{id}/status', [ShipmentController::class, 'updateStatus'])
        ->middleware('permission:shipping.update')
        ->name('api.v1.admin.shipments.status.update');
});
