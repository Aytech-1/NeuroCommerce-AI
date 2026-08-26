<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Coupon;

use App\Modules\Auth\Models\User;
use App\Modules\Cart\Models\Cart;
use App\Modules\Catalog\Enums\ProductStatus;
use App\Modules\Catalog\Models\Product;
use App\Modules\Coupon\Models\Coupon;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CartCouponIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->customer = User::factory()->create();
        $this->product = Product::factory()->create([
            'base_price' => 100.0,
            'status' => ProductStatus::ACTIVE,
            'is_active' => true,
        ]);

        $warehouse = Warehouse::first();
        InventoryItem::create([
            'product_id' => $this->product->id,
            'variant_id' => null,
            'warehouse_id' => $warehouse->id,
            'quantity_on_hand' => 100,
            'quantity_reserved' => 0,
            'reorder_point' => 10,
            'reorder_quantity' => 20,
        ]);
    }

    public function test_authenticated_user_can_apply_and_remove_coupon_from_cart(): void
    {
        Sanctum::actingAs($this->customer);

        // Add item to cart
        $addItemResponse = $this->postJson('/api/v1/cart/items', [
            'product_id' => $this->product->id,
            'quantity' => 1,
        ]);
        $addItemResponse->assertStatus(201);

        // Apply WELCOME10 (10% discount on $100 = $10)
        $applyResponse = $this->postJson('/api/v1/cart/coupon', [
            'code' => 'WELCOME10',
        ]);

        $applyResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.subtotal', fn ($v) => (float) $v === 100.0)
            ->assertJsonPath('data.notes', 'Coupon: WELCOME10');

        // Check cart summary
        $summaryResponse = $this->getJson('/api/v1/cart/summary');
        $summaryResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.subtotal', fn ($v) => (float) $v === 100.0)
            ->assertJsonPath('data.discount', fn ($v) => (float) $v === 10.0)
            ->assertJsonPath('data.total', fn ($v) => (float) $v === 90.0)
            ->assertJsonPath('data.coupon_code', 'WELCOME10');

        // Remove coupon
        $removeResponse = $this->deleteJson('/api/v1/cart/coupon');

        $removeResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        // Summary after removal
        $summaryAfterRemoval = $this->getJson('/api/v1/cart/summary');
        $summaryAfterRemoval->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.discount', fn ($v) => (float) $v === 0.0)
            ->assertJsonPath('data.total', fn ($v) => (float) $v === 100.0);
    }
}
