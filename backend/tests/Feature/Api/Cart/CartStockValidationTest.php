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

test('adding quantity exceeding available stock returns 422 business rule violation', function () {
    // Set stock to 2
    \App\Modules\Inventory\Models\InventoryItem::where('product_id', $this->product->id)
        ->update(['quantity_on_hand' => 2, 'quantity_reserved' => 0]);

    $response = $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 5, // Valid quantity (<= 100), but exceeds stock (2)
        ]);

    $response->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'BUSINESS_RULE_VIOLATION');
});

test('cannot add inactive or draft products to cart', function () {
    $this->product->status = 'draft';
    $this->product->is_active = false;
    $this->product->save();

    $response = $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);

    $response->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'BUSINESS_RULE_VIOLATION');
});
