<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->admin = User::where('email', 'admin@neurocommerce.test')->first() ?? User::factory()->create();
    $this->admin->givePermissionTo('order.view', 'order.update');
});

test('admin can list orders with filters and pagination', function () {
    Sanctum::actingAs($this->admin);

    Order::factory()->count(3)->create();

    $response = $this->getJson('/api/v1/admin/orders');

    $response->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'order_number', 'status', 'total_amount'],
            ],
            'meta' => ['total'],
        ]);
});

test('admin can update order status along the state machine', function () {
    Sanctum::actingAs($this->admin);

    $order = Order::factory()->create([
        'status' => OrderStatus::PAID,
    ]);

    // Update to PROCESSING
    $response = $this->patchJson("/api/v1/admin/orders/{$order->id}/status", [
        'status' => 'processing',
        'comment' => 'Picked up by fulfillment warehouse',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.status', 'processing');

    $order->refresh();
    expect($order->status)->toBe(OrderStatus::PROCESSING);
});

test('admin can add staff notes and view timeline history', function () {
    Sanctum::actingAs($this->admin);

    $order = Order::factory()->create();

    // Add note
    $noteResponse = $this->postJson("/api/v1/admin/orders/{$order->id}/notes", [
        'notes' => 'Customer called to verify delivery gate code.',
    ]);

    $noteResponse->assertStatus(200);

    // View timeline
    $timelineResponse = $this->getJson("/api/v1/admin/orders/{$order->id}/timeline");
    $timelineResponse->assertStatus(200)
        ->assertJsonPath('success', true);
});
