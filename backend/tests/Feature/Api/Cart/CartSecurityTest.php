<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->userA = User::factory()->create();
    $this->userB = User::factory()->create();
    $this->product = Product::where('status', 'active')->doesntHave('variants')->first();
});

test('unauthenticated request to wishlist endpoints returns 401', function () {
    $this->getJson('/api/v1/customer/wishlist')
        ->assertStatus(401)
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'UNAUTHORIZED');
});

test('user cannot mutate another users cart item by guessing item id', function () {
    // User A creates a cart item
    Sanctum::actingAs($this->userA);
    $addResponse = $this->postJson('/api/v1/cart/items', [
        'product_id' => $this->product->id,
        'quantity' => 1,
    ]);
    $itemAId = $addResponse->json('data.id');

    // User B tries to modify User A's item
    Sanctum::actingAs($this->userB);
    $tamperResponse = $this->putJson("/api/v1/cart/items/{$itemAId}", [
        'quantity' => 5,
    ]);

    // Resource not found in User B's cart
    $tamperResponse->assertStatus(404)
        ->assertJsonPath('success', false)
        ->assertJsonPath('code', 'RESOURCE_NOT_FOUND');
});
