<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Cart;

use App\Modules\Auth\Models\User;
use App\Modules\Cart\Models\Wishlist;
use App\Modules\Cart\Models\WishlistItem;
use App\Modules\Cart\Services\WishlistService;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase21WishlistCustomerExperienceTest extends TestCase
{
    use RefreshDatabase;

    protected User $customerA;
    protected User $customerB;
    protected Product $activeProduct;
    protected Product $inactiveProduct;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->customerA = User::factory()->customer()->create();
        $this->customerB = User::factory()->customer()->create();

        $this->activeProduct = Product::where('status', 'active')->doesntHave('variants')->first() ?? Product::factory()->create();
        $this->inactiveProduct = Product::factory()->draft()->create(['is_active' => false]);
    }

    public function test_authenticated_customer_can_retrieve_wishlist(): void
    {
        Sanctum::actingAs($this->customerA, ['*']);

        $response = $this->getJson('/api/v1/customer/wishlist');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'user_id',
                    'name',
                    'items',
                    'items_count',
                ],
            ]);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $response = $this->getJson('/api/v1/customer/wishlist');

        $response->assertStatus(401);
    }

    public function test_customer_can_add_product_to_wishlist(): void
    {
        Sanctum::actingAs($this->customerA, ['*']);

        $response = $this->postJson('/api/v1/customer/wishlist', [
            'product_id' => $this->activeProduct->id,
            'notes' => 'Holiday gift idea',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.product_id', $this->activeProduct->id)
            ->assertJsonPath('data.notes', 'Holiday gift idea')
            ->assertJsonPath('data.product.in_stock', true);

        $this->assertDatabaseHas('wishlist_items', [
            'product_id' => $this->activeProduct->id,
            'notes' => 'Holiday gift idea',
        ]);
    }

    public function test_customer_can_add_product_with_variant_to_wishlist(): void
    {
        Sanctum::actingAs($this->customerA, ['*']);

        $variant = ProductVariant::where('product_id', $this->activeProduct->id)->first() ?? ProductVariant::create([
            'product_id' => $this->activeProduct->id,
            'sku' => 'SKU-VAR-' . uniqid(),
            'name' => 'Blue / Large',
            'price' => '29.99',
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/customer/wishlist', [
            'product_id' => $this->activeProduct->id,
            'variant_id' => $variant->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.variant_id', $variant->id);
    }

    public function test_adding_inactive_product_is_rejected(): void
    {
        Sanctum::actingAs($this->customerA, ['*']);

        $response = $this->postJson('/api/v1/customer/wishlist', [
            'product_id' => $this->inactiveProduct->id,
        ]);

        $response->assertStatus(422);
    }

    public function test_duplicate_addition_is_handled_idempotently(): void
    {
        Sanctum::actingAs($this->customerA, ['*']);

        // First add
        $this->postJson('/api/v1/customer/wishlist', [
            'product_id' => $this->activeProduct->id,
            'notes' => 'First note',
        ])->assertStatus(201);

        // Second add with updated note
        $response = $this->postJson('/api/v1/customer/wishlist', [
            'product_id' => $this->activeProduct->id,
            'notes' => 'Updated note',
        ]);

        $response->assertStatus(201);

        $wishlist = Wishlist::where('user_id', $this->customerA->id)->first();
        $this->assertEquals(1, $wishlist->items()->count());
    }

    public function test_customer_can_check_wishlist_status(): void
    {
        Sanctum::actingAs($this->customerA, ['*']);

        // Before adding
        $check1 = $this->getJson("/api/v1/customer/wishlist/check/{$this->activeProduct->id}");
        $check1->assertStatus(200)->assertJsonPath('data.is_wishlisted', false);

        // Add
        $this->postJson('/api/v1/customer/wishlist', ['product_id' => $this->activeProduct->id]);

        // After adding
        $check2 = $this->getJson("/api/v1/customer/wishlist/check/{$this->activeProduct->id}");
        $check2->assertStatus(200)->assertJsonPath('data.is_wishlisted', true);
    }

    public function test_customer_can_remove_item_from_wishlist(): void
    {
        Sanctum::actingAs($this->customerA, ['*']);

        $this->postJson('/api/v1/customer/wishlist', ['product_id' => $this->activeProduct->id]);

        $response = $this->deleteJson("/api/v1/customer/wishlist/{$this->activeProduct->id}");
        $response->assertStatus(200)->assertJsonPath('success', true);

        $check = $this->getJson("/api/v1/customer/wishlist/check/{$this->activeProduct->id}");
        $check->assertJsonPath('data.is_wishlisted', false);
    }

    public function test_customer_a_cannot_remove_or_affect_customer_b_wishlist(): void
    {
        // Add to Customer B wishlist
        Sanctum::actingAs($this->customerB, ['*']);
        $this->postJson('/api/v1/customer/wishlist', ['product_id' => $this->activeProduct->id]);

        // Customer A tries to delete Customer B's item
        Sanctum::actingAs($this->customerA, ['*']);
        $response = $this->deleteJson("/api/v1/customer/wishlist/{$this->activeProduct->id}");
        $response->assertStatus(200);

        // Verify Customer B's item is still there
        Sanctum::actingAs($this->customerB, ['*']);
        $check = $this->getJson("/api/v1/customer/wishlist/check/{$this->activeProduct->id}");
        $check->assertJsonPath('data.is_wishlisted', true);
    }

    public function test_customer_can_move_item_to_active_cart(): void
    {
        Sanctum::actingAs($this->customerA, ['*']);

        // Add to wishlist
        $this->postJson('/api/v1/customer/wishlist', ['product_id' => $this->activeProduct->id])
            ->assertStatus(201);

        // Move to cart
        $response = $this->postJson("/api/v1/customer/wishlist/{$this->activeProduct->id}/move-to-cart");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.product_id', $this->activeProduct->id);

        // Assert removed from wishlist
        $checkWishlist = $this->getJson("/api/v1/customer/wishlist/check/{$this->activeProduct->id}");
        $checkWishlist->assertJsonPath('data.is_wishlisted', false);

        // Assert present in cart
        $cartResponse = $this->getJson('/api/v1/cart');
        $cartResponse->assertStatus(200)
            ->assertJsonPath('data.item_count', 1);
    }

    public function test_move_nonexistent_wishlist_item_to_cart_returns_404(): void
    {
        Sanctum::actingAs($this->customerA, ['*']);

        $response = $this->postJson("/api/v1/customer/wishlist/{$this->activeProduct->id}/move-to-cart");

        $response->assertStatus(404);
    }

    public function test_wishlist_service_can_remove_purchased_items(): void
    {
        Sanctum::actingAs($this->customerA, ['*']);

        $this->postJson('/api/v1/customer/wishlist', ['product_id' => $this->activeProduct->id]);

        $service = app(WishlistService::class);
        $service->removePurchasedItems((string) $this->customerA->id, [$this->activeProduct->id]);

        $check = $this->getJson("/api/v1/customer/wishlist/check/{$this->activeProduct->id}");
        $check->assertJsonPath('data.is_wishlisted', false);
    }
}
