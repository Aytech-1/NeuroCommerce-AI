<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use App\Modules\Inventory\Models\InventoryItem;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->product = Product::where('status', 'active')->doesntHave('variants')->first();
    $this->sessionId = (string) Str::uuid();
});

test('guest can create and retrieve shopping cart via session id header', function () {
    $response = $this->withHeader('X-Session-Id', $this->sessionId)
        ->getJson('/api/v1/cart');

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.session_id', $this->sessionId)
        ->assertJsonPath('data.is_guest', true);
});

test('guest can add item to cart with server-side price snapshot', function () {
    $expectedPrice = (float) $this->product->base_price;
    $response = $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_price' => 5.00, // Tampered price submitted by client should be IGNORED!
        ]);

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.product_id', $this->product->id)
        ->assertJsonPath('data.quantity', 2)
        ->assertJsonPath('data.unit_price', fn ($val) => (float) $val === $expectedPrice)
        ->assertJsonPath('data.line_total', fn ($val) => (float) $val === $expectedPrice * 2);

    // Verify cart reflects total
    $cartResponse = $this->withHeader('X-Session-Id', $this->sessionId)
        ->getJson('/api/v1/cart');

    $cartResponse->assertStatus(200)
        ->assertJsonPath('data.item_count', 2)
        ->assertJsonPath('data.subtotal', fn ($val) => (float) $val === $expectedPrice * 2);
});

test('guest adding existing item increments quantity up to available stock', function () {
    $expectedPrice = (float) $this->product->base_price;
    $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ])->assertStatus(201);

    $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 3,
        ])->assertStatus(201);

    $cartResponse = $this->withHeader('X-Session-Id', $this->sessionId)
        ->getJson('/api/v1/cart');

    $cartResponse->assertStatus(200)
        ->assertJsonPath('data.item_count', 5)
        ->assertJsonPath('data.subtotal', fn ($val) => (float) $val === $expectedPrice * 5);
});
