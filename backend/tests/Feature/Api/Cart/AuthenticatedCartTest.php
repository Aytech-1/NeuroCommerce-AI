<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->user = User::factory()->create();
    $this->product = Product::factory()->create([
        'base_price' => 50000.0,
        'is_active' => true,
        'status' => 'active',
    ]);

    $warehouse = Warehouse::first();
    InventoryItem::create([
        'product_id' => $this->product->id,
        'variant_id' => null,
        'warehouse_id' => $warehouse->id,
        'quantity_on_hand' => 100,
        'quantity_reserved' => 0,
        'reorder_point' => 10,
        'reorder_quantity' => 20,
    ]);
});

test('authenticated user can retrieve their persistent cart', function () {
    Sanctum::actingAs($this->user);

    $response = $this->getJson('/api/v1/cart');

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.user_id', $this->user->id)
        ->assertJsonPath('data.is_guest', false);
});

test('authenticated user can add items, apply coupon, and view financial summary', function () {
    Sanctum::actingAs($this->user);

    $this->postJson('/api/v1/cart/items', [
        'product_id' => $this->product->id,
        'quantity' => 3,
    ])->assertStatus(201);

    // Apply coupon
    $couponResponse = $this->postJson('/api/v1/cart/coupon', [
        'code' => 'WELCOME10',
    ]);

    $couponResponse->assertStatus(200)
        ->assertJsonPath('success', true);

    // Get summary
    $summaryResponse = $this->getJson('/api/v1/cart/summary');

    $summaryResponse->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.item_count', 3)
        ->assertJsonPath('data.coupon_code', 'WELCOME10');

    // Remove coupon
    $removeCouponResponse = $this->deleteJson('/api/v1/cart/coupon');
    $removeCouponResponse->assertStatus(200)
        ->assertJsonPath('success', true);
});
