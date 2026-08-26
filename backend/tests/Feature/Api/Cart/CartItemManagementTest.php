<?php

declare(strict_types=1);

use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->product = Product::where('status', 'active')->doesntHave('variants')->first();
    $this->sessionId = (string) Str::uuid();
});

test('user can update cart item quantity within available stock', function () {
    $addResponse = $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

    $itemId = $addResponse->json('data.id');

    $updateResponse = $this->withHeader('X-Session-Id', $this->sessionId)
        ->putJson("/api/v1/cart/items/{$itemId}", [
            'quantity' => 5,
        ]);

    $updateResponse->assertStatus(200)
        ->assertJsonPath('data.quantity', 5)
        ->assertJsonPath('data.line_total', fn ($val) => (float) $val === (float) $this->product->base_price * 5);
});

test('user can remove an item and clear the entire cart', function () {
    $addResponse = $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ]);

    $itemId = $addResponse->json('data.id');

    // Remove single item
    $this->withHeader('X-Session-Id', $this->sessionId)
        ->deleteJson("/api/v1/cart/items/{$itemId}")
        ->assertStatus(200)
        ->assertJsonPath('success', true);

    $this->assertDatabaseMissing('cart_items', ['id' => $itemId]);

    // Add again and clear all
    $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
        ])->assertStatus(201);

    $this->withHeader('X-Session-Id', $this->sessionId)
        ->deleteJson('/api/v1/cart')
        ->assertStatus(200)
        ->assertJsonPath('success', true);

    $this->withHeader('X-Session-Id', $this->sessionId)
        ->getJson('/api/v1/cart')
        ->assertJsonPath('data.item_count', 0);
});
