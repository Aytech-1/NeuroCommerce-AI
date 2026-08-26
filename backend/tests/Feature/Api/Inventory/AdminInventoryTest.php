<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Inventory\Enums\StockMovementType;
use App\Modules\Inventory\Events\StockAdjusted;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->superAdmin = User::where('email', 'admin@neurocommerce.com')->first();
    $this->warehouse = Warehouse::where('is_default', true)->first();
    $this->product = Product::first();
});

test('admin can list inventory items with pagination envelope', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    $response = $this->getJson('/api/v1/admin/inventory');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                '*' => [
                    'id',
                    'product_id',
                    'warehouse_id',
                    'quantity_on_hand',
                    'quantity_reserved',
                    'quantity_available',
                    'reorder_point',
                    'is_low_stock',
                    'is_out_of_stock',
                ],
            ],
            'meta',
            'links',
        ]);
});

test('admin can view single inventory item with movement history', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    $item = InventoryItem::first();

    $response = $this->getJson("/api/v1/admin/inventory/{$item->id}");

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.id', $item->id);
});

test('admin can adjust stock upward with audit movement record and event', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);
    Event::fake([StockAdjusted::class]);

    $item = InventoryItem::first();
    $initialOnHand = $item->quantity_on_hand;

    $payload = [
        'product_id' => $item->product_id,
        'variant_id' => $item->variant_id,
        'warehouse_id' => $item->warehouse_id,
        'quantity_delta' => 75,
        'movement_type' => StockMovementType::RECEIPT->value,
        'notes' => 'Shipment received from supplier',
    ];

    $response = $this->postJson('/api/v1/admin/inventory/adjust', $payload);

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.quantity_on_hand', $initialOnHand + 75);

    $this->assertDatabaseHas('inv_stock_movements', [
        'movement_type' => StockMovementType::RECEIPT->value,
        'quantity' => 75,
        'notes' => 'Shipment received from supplier',
        'performed_by' => $this->superAdmin->id,
    ]);

    Event::assertDispatched(StockAdjusted::class);
});

test('admin stock deduction cannot result in negative stock on hand', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    $item = InventoryItem::first();

    $payload = [
        'product_id' => $item->product_id,
        'variant_id' => $item->variant_id,
        'warehouse_id' => $item->warehouse_id,
        'quantity_delta' => -($item->quantity_on_hand + 500),
        'movement_type' => StockMovementType::ADJUSTMENT->value,
        'notes' => 'Excess deduction attempt',
    ];

    $response = $this->postJson('/api/v1/admin/inventory/adjust', $payload);

    $response->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'BUSINESS_RULE_VIOLATION');
});

test('admin can transfer stock atomically between warehouses', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    $sourceWh = Warehouse::where('code', 'WH-LOS-01')->first();
    $destWh = Warehouse::where('code', 'WH-ABJ-02')->first();
    $item = InventoryItem::where('warehouse_id', $sourceWh->id)->first();

    $payload = [
        'product_id' => $item->product_id,
        'variant_id' => $item->variant_id,
        'source_warehouse_id' => $sourceWh->id,
        'destination_warehouse_id' => $destWh->id,
        'quantity' => 20,
        'notes' => 'Inter-branch rebalancing',
    ];

    $response = $this->postJson('/api/v1/admin/inventory/transfer', $payload);

    $response->assertStatus(200)
        ->assertJsonPath('success', true);

    $this->assertDatabaseHas('inv_stock_movements', [
        'movement_type' => StockMovementType::TRANSFER->value,
        'quantity' => -20,
    ]);
    $this->assertDatabaseHas('inv_stock_movements', [
        'movement_type' => StockMovementType::TRANSFER->value,
        'quantity' => 20,
    ]);
});

test('admin can filter low stock items', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    // Artificially make one item low stock
    $item = InventoryItem::first();
    $item->quantity_on_hand = 8;
    $item->quantity_reserved = 0;
    $item->reorder_point = 15;
    $item->save();

    $response = $this->getJson('/api/v1/admin/inventory/low-stock');

    $response->assertStatus(200)
        ->assertJsonPath('success', true);

    expect($response->json('meta.total'))->toBeGreaterThanOrEqual(1);
});

test('admin can view stock movements audit ledger', function () {
    Sanctum::actingAs($this->superAdmin, ['*']);

    $response = $this->getJson('/api/v1/admin/inventory/movements');

    $response->assertStatus(200)
        ->assertJsonPath('success', true);

    expect($response->json('meta.total'))->toBeGreaterThanOrEqual(1);
});
