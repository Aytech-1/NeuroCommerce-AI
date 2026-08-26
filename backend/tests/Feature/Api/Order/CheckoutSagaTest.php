<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->user = User::factory()->create();
    $this->product = Product::where('status', 'active')->doesntHave('variants')->first();
    $this->sessionId = (string) Str::uuid();
});

test('authenticated user can successfully checkout with cart items', function () {
    Sanctum::actingAs($this->user);

    // 1. Add item to cart
    $this->postJson('/api/v1/cart/items', [
        'product_id' => $this->product->id,
        'quantity' => 2,
    ])->assertStatus(201);

    // 2. Execute Checkout
    $checkoutPayload = [
        'billing_address' => [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'address_line_1' => '456 Market St',
            'city' => 'San Francisco',
            'state_province' => 'CA',
            'postal_code' => '94105',
            'country_code' => 'US',
        ],
        'shipping_address' => [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'address_line_1' => '456 Market St',
            'city' => 'San Francisco',
            'state_province' => 'CA',
            'postal_code' => '94105',
            'country_code' => 'US',
        ],
        'shipping_method' => 'standard',
        'payment_method' => 'stripe',
        'payment_token' => 'tok_visa',
        'coupon_code' => 'WELCOME10',
    ];

    $response = $this->postJson('/api/v1/checkout', $checkoutPayload);

    $expectedSubtotal = (float) $this->product->base_price * 2;
    $expectedDiscount = round($expectedSubtotal * 0.10, 2);
    $expectedTotal = $expectedSubtotal - $expectedDiscount;

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.order.status', 'paid')
        ->assertJsonPath('data.order.item_count', 1)
        ->assertJsonPath('data.payment.status', 'succeeded');

    // 3. Assert Cart was cleared
    $cartResponse = $this->getJson('/api/v1/cart');
    $cartResponse->assertJsonPath('data.item_count', 0);

    // 4. Assert Order exists in database
    $this->assertDatabaseHas('orders', [
        'user_id' => $this->user->id,
        'status' => 'paid',
        'coupon_code' => 'WELCOME10',
    ]);
});

test('guest can successfully checkout with X-Session-Id and guest info', function () {
    // 1. Guest adds item to cart
    $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 1,
        ])->assertStatus(201);

    // 2. Guest Executes Checkout
    $checkoutPayload = [
        'billing_address' => [
            'first_name' => 'Alice',
            'last_name' => 'Guest',
            'address_line_1' => '789 Guest Way',
            'city' => 'New York',
            'state_province' => 'NY',
            'postal_code' => '10001',
            'country_code' => 'US',
        ],
        'shipping_address' => [
            'first_name' => 'Alice',
            'last_name' => 'Guest',
            'address_line_1' => '789 Guest Way',
            'city' => 'New York',
            'state_province' => 'NY',
            'postal_code' => '10001',
            'country_code' => 'US',
        ],
        'shipping_method' => 'standard',
        'payment_method' => 'stripe',
        'guest_email' => 'alice.guest@example.com',
        'guest_first_name' => 'Alice',
        'guest_last_name' => 'Guest',
    ];

    $response = $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/checkout', $checkoutPayload);

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.order.status', 'paid');
});

test('checkout pre-validation returns validity and estimated financials', function () {
    Sanctum::actingAs($this->user);

    $this->postJson('/api/v1/cart/items', [
        'product_id' => $this->product->id,
        'quantity' => 2,
    ])->assertStatus(201);

    $response = $this->postJson('/api/v1/checkout/validate', [
        'shipping_address' => [
            'postal_code' => '94105',
            'country_code' => 'US',
        ],
        'coupon_code' => 'WELCOME10',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.is_valid', true)
        ->assertJsonPath('data.item_count', 2);
});
