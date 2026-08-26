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
    $this->user = User::factory()->create();
    $this->product = Product::where('status', 'active')->doesntHave('variants')->first();
});

test('authenticated user can add, check, and remove items from wishlist', function () {
    Sanctum::actingAs($this->user);

    // 1. Add to wishlist
    $addResponse = $this->postJson('/api/v1/customer/wishlist', [
        'product_id' => $this->product->id,
        'notes' => 'Looking forward to this!',
    ]);

    $addResponse->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.product_id', $this->product->id);

    // 2. Check wishlist status
    $checkResponse = $this->getJson("/api/v1/customer/wishlist/check/{$this->product->id}");
    $checkResponse->assertStatus(200)
        ->assertJsonPath('data.is_wishlisted', true);

    // 3. Get wishlist list
    $listResponse = $this->getJson('/api/v1/customer/wishlist');
    $listResponse->assertStatus(200)
        ->assertJsonPath('data.items_count', 1);

    // 4. Remove from wishlist
    $deleteResponse = $this->deleteJson("/api/v1/customer/wishlist/{$this->product->id}");
    $deleteResponse->assertStatus(200)
        ->assertJsonPath('success', true);

    $checkAgain = $this->getJson("/api/v1/customer/wishlist/check/{$this->product->id}");
    $checkAgain->assertJsonPath('data.is_wishlisted', false);
});

test('user can move item from wishlist to active cart', function () {
    Sanctum::actingAs($this->user);

    // Add to wishlist
    $this->postJson('/api/v1/customer/wishlist', [
        'product_id' => $this->product->id,
    ])->assertStatus(201);

    // Move to cart
    $moveResponse = $this->postJson("/api/v1/customer/wishlist/{$this->product->id}/move-to-cart");

    $moveResponse->assertStatus(200)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.product_id', $this->product->id)
        ->assertJsonPath('data.quantity', 1);

    // Assert item no longer in wishlist
    $checkWishlist = $this->getJson("/api/v1/customer/wishlist/check/{$this->product->id}");
    $checkWishlist->assertJsonPath('data.is_wishlisted', false);

    // Assert item is in cart
    $cartResponse = $this->getJson('/api/v1/cart');
    $cartResponse->assertJsonPath('data.item_count', 1);
});
