<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Inventory\Models\InventoryItem;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->user = User::factory()->create();
    $this->product = Product::where('status', 'active')->doesntHave('variants')->first();
});

test('failed payment releases reserved stock and preserves user cart', function () {
    Sanctum::actingAs($this->user);

    // Initial stock
    $invItem = InventoryItem::where('product_id', $this->product->id)->first();
    $initialReserved = $invItem->quantity_reserved;

    // 1. Add item to cart
    $this->postJson('/api/v1/cart/items', [
        'product_id' => $this->product->id,
        'quantity' => 2,
    ])->assertStatus(201);

    // 2. Checkout with failing mock token
    $checkoutPayload = [
        'billing_address' => [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'address_line_1' => '456 Market St',
            'city' => 'San Francisco',
            'postal_code' => '94105',
            'country_code' => 'US',
        ],
        'shipping_address' => [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'address_line_1' => '456 Market St',
            'city' => 'San Francisco',
            'postal_code' => '94105',
            'country_code' => 'US',
        ],
        'payment_method' => 'stripe',
        'payment_token' => 'tok_chargeDeclined',
    ];

    $response = $this->postJson('/api/v1/checkout', $checkoutPayload);

    // 3. Assert failure returned
    $response->assertStatus(422)
        ->assertJsonPath('success', false);

    // 4. Assert stock was NOT held (reserved back to initial)
    $invItem->refresh();
    expect($invItem->quantity_reserved)->toBe($initialReserved);

    // 5. Assert user cart remains intact for retry
    $cartResponse = $this->getJson('/api/v1/cart');
    $cartResponse->assertJsonPath('data.item_count', 2);
});

test('checkout fails when stock is completely depleted', function () {
    Sanctum::actingAs($this->user);

    $this->postJson('/api/v1/cart/items', [
        'product_id' => $this->product->id,
        'quantity' => 2,
    ])->assertStatus(201);

    // Drain stock
    InventoryItem::where('product_id', $this->product->id)
        ->update(['quantity_on_hand' => 0]);

    $checkoutPayload = [
        'billing_address' => [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'address_line_1' => '456 Market St',
            'city' => 'San Francisco',
            'postal_code' => '94105',
            'country_code' => 'US',
        ],
        'shipping_address' => [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'address_line_1' => '456 Market St',
            'city' => 'San Francisco',
            'postal_code' => '94105',
            'country_code' => 'US',
        ],
        'payment_method' => 'stripe',
        'payment_token' => 'tok_visa',
    ];

    $response = $this->postJson('/api/v1/checkout', $checkoutPayload);

    $response->assertStatus(422)
        ->assertJsonPath('success', false);
});
