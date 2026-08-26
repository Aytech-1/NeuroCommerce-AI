<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->user = User::factory()->create();
    $this->product = Product::where('status', 'active')->doesntHave('variants')->first();
});

test('historical order line items remain unchanged after product catalog is altered or price increases', function () {
    Sanctum::actingAs($this->user);

    $originalName = $this->product->name;
    $originalSku = $this->product->sku;
    $originalPrice = (float) $this->product->base_price;

    // 1. Add to cart & Checkout
    $this->postJson('/api/v1/cart/items', [
        'product_id' => $this->product->id,
        'quantity' => 2,
    ])->assertStatus(201);

    $checkoutResponse = $this->postJson('/api/v1/checkout', [
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
    ])->assertStatus(201);

    $orderId = $checkoutResponse->json('data.order.id');

    // 2. Admin alters the catalog product (price hike + name change)
    $this->product->update([
        'name' => 'Completely Different Product Name 2027',
        'sku' => 'SKU-MODIFIED-999',
        'base_price' => 9999.00,
    ]);

    // 3. Inspect historical order item in database
    $orderItem = OrderItem::where('order_id', $orderId)->first();

    expect($orderItem->product_name)->toBe($originalName);
    expect($orderItem->product_sku)->toBe($originalSku);
    expect((float) $orderItem->unit_price)->toBe($originalPrice);
    expect((float) $orderItem->line_total)->toBe($originalPrice * 2);
});
