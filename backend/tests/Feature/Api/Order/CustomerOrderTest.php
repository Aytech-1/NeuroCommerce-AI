<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->user = User::factory()->create();
    $this->product = Product::where('status', 'active')->doesntHave('variants')->first();
});

test('customer can list their orders with pagination envelope', function () {
    Sanctum::actingAs($this->user);

    // Create 2 orders for user
    Order::factory()->count(2)->create([
        'user_id' => $this->user->id,
    ]);

    $response = $this->getJson('/api/v1/customer/orders');

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'order_number', 'status', 'total_amount', 'created_at'],
            ],
            'meta' => ['current_page', 'per_page', 'total'],
        ]);

    expect($response->json('meta.total'))->toBe(2);
});

test('customer can view order details, line items, and tracking info', function () {
    Sanctum::actingAs($this->user);

    $order = Order::factory()->create([
        'user_id' => $this->user->id,
        'status' => OrderStatus::PAID,
    ]);

    // Show
    $showResponse = $this->getJson("/api/v1/customer/orders/{$order->id}");
    $showResponse->assertStatus(200)
        ->assertJsonPath('data.id', $order->id)
        ->assertJsonPath('data.order_number', $order->order_number);

    // Tracking
    $trackingResponse = $this->getJson("/api/v1/customer/orders/{$order->id}/tracking");
    $trackingResponse->assertStatus(200)
        ->assertJsonPath('data.order_number', $order->order_number);
});

test('customer can cancel a pending order', function () {
    Sanctum::actingAs($this->user);

    $order = Order::factory()->create([
        'user_id' => $this->user->id,
        'status' => OrderStatus::PENDING,
    ]);

    $cancelResponse = $this->postJson("/api/v1/customer/orders/{$order->id}/cancel", [
        'reason' => 'Changed my mind',
    ]);

    $cancelResponse->assertStatus(200)
        ->assertJsonPath('data.status', 'cancelled');

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::CANCELLED);
});

test('customer cannot cancel an order that is already shipped', function () {
    Sanctum::actingAs($this->user);

    $order = Order::factory()->create([
        'user_id' => $this->user->id,
        'status' => OrderStatus::SHIPPED,
    ]);

    $cancelResponse = $this->postJson("/api/v1/customer/orders/{$order->id}/cancel");

    $cancelResponse->assertStatus(422)
        ->assertJsonPath('success', false);
});
