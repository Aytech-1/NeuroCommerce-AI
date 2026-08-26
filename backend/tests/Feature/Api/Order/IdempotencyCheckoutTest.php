<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Order\Models\Order;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->user = User::factory()->create();
    $this->product = Product::where('status', 'active')->doesntHave('variants')->first();
    $this->idempotencyKey = (string) Str::uuid();
});

test('duplicate request with same idempotency key returns cached response without creating second order', function () {
    Sanctum::actingAs($this->user);

    $this->postJson('/api/v1/cart/items', [
        'product_id' => $this->product->id,
        'quantity' => 1,
    ])->assertStatus(201);

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

    // Request 1
    $response1 = $this->withHeader('Idempotency-Key', $this->idempotencyKey)
        ->postJson('/api/v1/checkout', $checkoutPayload);

    $response1->assertStatus(201);
    $orderNumber1 = $response1->json('data.order.order_number');

    // Request 2 (Replay with same Idempotency-Key)
    $response2 = $this->withHeader('Idempotency-Key', $this->idempotencyKey)
        ->postJson('/api/v1/checkout', $checkoutPayload);

    $response2->assertStatus(201);
    $orderNumber2 = $response2->json('data.order.order_number');

    // Assert both returned same order number
    expect($orderNumber1)->toBe($orderNumber2);

    // Assert only 1 order exists for this user in DB
    $orderCount = Order::where('user_id', $this->user->id)->count();
    expect($orderCount)->toBe(1);
});
