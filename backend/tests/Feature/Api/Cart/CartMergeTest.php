<?php

declare(strict_types=1);

use App\Modules\Auth\Models\User;
use App\Modules\Cart\Services\CartService;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(DatabaseSeeder::class);
    $this->user = User::factory()->create();
    $products = Product::where('status', 'active')->doesntHave('variants')->take(2)->get();
    $this->productA = $products[0];
    $this->productB = $products[1];
    $this->sessionId = (string) Str::uuid();
});

test('guest cart merges atomically into authenticated user cart', function () {
    $cartService = app(CartService::class);

    // 1. Guest adds Product A (qty 2) and Product B (qty 1)
    $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/cart/items', [
            'product_id' => $this->productA->id,
            'quantity' => 2,
        ])->assertStatus(201);

    $this->withHeader('X-Session-Id', $this->sessionId)
        ->postJson('/api/v1/cart/items', [
            'product_id' => $this->productB->id,
            'quantity' => 1,
        ])->assertStatus(201);

    // 2. User already has Product A (qty 1) in their account cart
    $cartService->addItem(
        userId: $this->user->id,
        sessionId: null,
        dto: new \App\Modules\Cart\DTOs\AddCartItemDTO(
            productId: $this->productA->id,
            variantId: null,
            quantity: 1
        )
    );

    // 3. Perform Merge
    $mergedCart = $cartService->mergeGuestCart($this->user->id, $this->sessionId);

    // 4. Assert Merged State
    expect($mergedCart->items)->toHaveCount(2);

    $itemA = $mergedCart->items->where('product_id', $this->productA->id)->first();
    $itemB = $mergedCart->items->where('product_id', $this->productB->id)->first();

    // 1 existing + 2 guest = 3
    expect($itemA->quantity)->toBe(3);
    // 1 guest = 1
    expect($itemB->quantity)->toBe(1);

    // 5. Assert Guest cart header was deleted
    $this->assertDatabaseMissing('carts', ['session_id' => $this->sessionId]);
});
