<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Inventory\Jobs\ReleaseExpiredStockReservationsJob;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Services\InventoryService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->inventoryService = app(InventoryService::class);
});

test('temporary stock reservation increments reserved quantity and reduces available stock', function () {
    $item = InventoryItem::first();
    $initialOnHand = $item->quantity_on_hand;
    $initialReserved = $item->quantity_reserved;

    $reservationId = $this->inventoryService->reserveStock([
        [
            'product_id' => $item->product_id,
            'variant_id' => $item->variant_id,
            'warehouse_id' => $item->warehouse_id,
            'quantity' => 5,
        ],
    ], 15);

    expect($reservationId)->toBeString();
    expect($item->fresh()->quantity_on_hand)->toBe($initialOnHand);
    expect($item->fresh()->quantity_reserved)->toBe($initialReserved + 5);
    expect($item->fresh()->quantity_available)->toBe($initialOnHand - ($initialReserved + 5));
});

test('releasing stock restores reserved quantity back to available', function () {
    $item = InventoryItem::first();
    $initialReserved = $item->quantity_reserved;

    $reservationId = $this->inventoryService->reserveStock([
        [
            'product_id' => $item->product_id,
            'variant_id' => $item->variant_id,
            'warehouse_id' => $item->warehouse_id,
            'quantity' => 10,
        ],
    ], 15);

    expect($item->fresh()->quantity_reserved)->toBe($initialReserved + 10);

    $this->inventoryService->releaseStock($reservationId, 'Customer abandoned cart');

    expect($item->fresh()->quantity_reserved)->toBe($initialReserved);
});

test('expired reservations are automatically released by background job', function () {
    $item = InventoryItem::first();
    $initialReserved = $item->quantity_reserved;

    $reservationId = $this->inventoryService->reserveStock([
        [
            'product_id' => $item->product_id,
            'variant_id' => $item->variant_id,
            'warehouse_id' => $item->warehouse_id,
            'quantity' => 10,
        ],
    ], 15);

    expect($item->fresh()->quantity_reserved)->toBe($initialReserved + 10);

    // Fast-forward expiration in cache
    $cached = Cache::get("inventory:reservation:{$reservationId}");
    $cached['expires_at'] = now()->subMinutes(1)->timestamp;
    Cache::put("inventory:reservation:{$reservationId}", $cached, 3600);

    // Run release job
    $job = new ReleaseExpiredStockReservationsJob();
    $job->handle($this->inventoryService);

    expect($item->fresh()->quantity_reserved)->toBe($initialReserved);
});

test('deducting reserved stock finalizes order fulfillment and reduces physical on-hand', function () {
    $item = InventoryItem::first();
    $initialOnHand = $item->quantity_on_hand;
    $initialReserved = $item->quantity_reserved;

    $reservationId = $this->inventoryService->reserveStock([
        [
            'product_id' => $item->product_id,
            'variant_id' => $item->variant_id,
            'warehouse_id' => $item->warehouse_id,
            'quantity' => 15,
        ],
    ], 15);

    expect($item->fresh()->quantity_on_hand)->toBe($initialOnHand);
    expect($item->fresh()->quantity_reserved)->toBe($initialReserved + 15);

    // Deduct
    $this->inventoryService->deductReservedStock($reservationId, 'ORD-9999');

    expect($item->fresh()->quantity_on_hand)->toBe($initialOnHand - 15);
    expect($item->fresh()->quantity_reserved)->toBe($initialReserved);
});

test('overselling is strictly rejected when requested stock exceeds availability', function () {
    $item = InventoryItem::first();

    expect(function () use ($item) {
        $this->inventoryService->reserveStock([
            [
                'product_id' => $item->product_id,
                'variant_id' => $item->variant_id,
                'warehouse_id' => $item->warehouse_id,
                'quantity' => $item->quantity_available + 500,
            ],
        ], 15);
    })->toThrow(\App\Core\Exceptions\BusinessRuleException::class);
});
