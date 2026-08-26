<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Order\Models\Order;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->userA = User::factory()->create();
    $this->userB = User::factory()->create();
});

test('customer cannot view another customers order (IDOR defense)', function () {
    $orderA = Order::factory()->create([
        'user_id' => $this->userA->id,
    ]);

    // User B attempts to access User A's order
    Sanctum::actingAs($this->userB);

    $response = $this->getJson("/api/v1/customer/orders/{$orderA->id}");

    $response->assertStatus(403)
        ->assertJsonPath('success', false);
});

test('unauthenticated request to customer orders returns 401', function () {
    $this->getJson('/api/v1/customer/orders')
        ->assertStatus(401)
        ->assertJsonPath('success', false);
});

test('customer without admin permissions cannot access admin orders endpoints (403)', function () {
    Sanctum::actingAs($this->userA);

    $this->getJson('/api/v1/admin/orders')
        ->assertStatus(403);
});
