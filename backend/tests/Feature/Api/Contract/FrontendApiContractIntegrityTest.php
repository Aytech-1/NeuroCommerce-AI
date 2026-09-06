<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Contract;

use App\Modules\Auth\Models\User;
use App\Modules\Cart\Models\Cart;
use App\Modules\Cart\Models\CartItem;
use App\Modules\Catalog\Enums\ProductStatus;
use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\Warehouse;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FrontendApiContractIntegrityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_product_listing_and_detail_contracts_match_frontend_types(): void
    {
        $category = Category::first() ?? Category::factory()->create();
        $brand = Brand::first() ?? Brand::factory()->create();

        $product = Product::factory()->create([
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'status' => ProductStatus::ACTIVE,
            'base_price' => 199.99,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SKU-CONTRACT-001',
            'price' => 199.99,
            'is_active' => true,
        ]);

        // 1. Public Product Listing Contract
        $listResponse = $this->getJson('/api/v1/products');
        $listResponse->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'sku',
                        'base_price',
                        'currency_code',
                        'status',
                        'is_active',
                        'is_featured',
                    ],
                ],
                'meta' => ['current_page', 'per_page', 'total'],
            ]);

        // 2. Product Detail Contract
        $detailResponse = $this->getJson('/api/v1/products/' . $product->slug);
        $detailResponse->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'sku',
                    'description',
                    'base_price',
                    'currency_code',
                    'status',
                    'is_active',
                    'category',
                    'brand',
                    'variants' => [
                        '*' => [
                            'id',
                            'sku',
                            'price',
                            'is_active',
                        ],
                    ],
                ],
            ]);
    }

    public function test_cart_and_coupon_contracts_match_frontend_types(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $product = Product::factory()->create([
            'status' => ProductStatus::ACTIVE,
            'base_price' => 100.00,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SKU-CART-001',
            'price' => 100.00,
            'is_active' => true,
        ]);

        $warehouse = Warehouse::first() ?? Warehouse::factory()->create(['is_default' => true]);
        InventoryItem::create([
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'warehouse_id' => $warehouse->id,
            'quantity_on_hand' => 50,
            'quantity_reserved' => 0,
            'quantity_available' => 50,
            'reorder_point' => 5,
            'reorder_quantity' => 20,
        ]);

        // Cart Add Mutation
        $addResponse = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 2,
        ]);

        $addResponse->assertCreated()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'cart_id',
                    'product_id',
                    'variant_id',
                    'quantity',
                    'unit_price',
                    'line_total',
                ],
            ]);

        // Cart Fetch Contract
        $cartResponse = $this->getJson('/api/v1/cart');
        $cartResponse->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'items' => [
                        '*' => [
                            'id',
                            'product_id',
                            'quantity',
                            'unit_price',
                            'line_total',
                        ],
                    ],
                    'items_count',
                    'subtotal',
                    'discount_total',
                    'tax_total',
                    'shipping_total',
                    'grand_total',
                ],
            ]);
    }

    public function test_checkout_order_invoice_contracts_match_frontend_types(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $product = Product::factory()->create([
            'status' => ProductStatus::ACTIVE,
            'base_price' => 150.00,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SKU-CHK-001',
            'price' => 150.00,
            'is_active' => true,
        ]);

        $warehouse = Warehouse::first() ?? Warehouse::factory()->create(['is_default' => true]);
        InventoryItem::create([
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'warehouse_id' => $warehouse->id,
            'quantity_on_hand' => 20,
            'quantity_reserved' => 0,
            'quantity_available' => 20,
            'reorder_point' => 2,
            'reorder_quantity' => 10,
        ]);

        $cart = Cart::create(['user_id' => $user->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'quantity' => 1,
            'unit_price' => 150.00,
            'subtotal' => 150.00,
        ]);

        // Checkout Validation
        $valResponse = $this->postJson('/api/v1/checkout/validate', [
            'shipping_address' => [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'address_line_1' => '123 Contract Lane',
                'city' => 'Metropolis',
                'state_province' => 'NY',
                'postal_code' => '10001',
                'country_code' => 'US',
            ],
        ]);
        $valResponse->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'is_valid',
                    'item_count',
                    'subtotal',
                    'shipping_amount',
                    'tax_amount',
                    'discount_amount',
                    'total_amount',
                    'currency_code',
                ],
            ]);

        // Process Checkout
        $checkoutPayload = [
            'shipping_address' => [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'address_line_1' => '123 Contract Lane',
                'city' => 'Metropolis',
                'state_province' => 'NY',
                'postal_code' => '10001',
                'country_code' => 'US',
            ],
            'billing_address' => [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'address_line_1' => '123 Contract Lane',
                'city' => 'Metropolis',
                'state_province' => 'NY',
                'postal_code' => '10001',
                'country_code' => 'US',
            ],
            'shipping_method' => 'standard',
            'payment_method' => 'stripe',
        ];

        $checkoutResponse = $this->postJson('/api/v1/checkout', $checkoutPayload);
        $checkoutResponse->assertCreated()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'order' => [
                        'id',
                        'order_number',
                        'status',
                        'currency_code',
                        'subtotal',
                        'tax_amount',
                        'shipping_amount',
                        'discount_amount',
                        'total_amount',
                    ],
                    'payment' => [
                        'transaction_id',
                        'status',
                        'payment_method',
                    ],
                ],
            ]);

        $orderId = $checkoutResponse->json('data.order.id');

        // Customer Order Detail Contract
        $orderResponse = $this->getJson("/api/v1/customer/orders/{$orderId}");
        $orderResponse->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'order_number',
                    'status',
                    'currency_code',
                    'subtotal',
                    'tax_amount',
                    'shipping_amount',
                    'discount_amount',
                    'total_amount',
                    'item_count',
                    'items' => [
                        '*' => [
                            'id',
                            'product_name',
                            'product_sku',
                            'unit_price',
                            'quantity',
                            'line_total',
                        ],
                    ],
                ],
            ]);
    }

    public function test_admin_system_health_and_settings_contracts(): void
    {
        $admin = User::where('user_type', 'super_admin')->first() ?? User::factory()->create(['user_type' => 'super_admin', 'is_active' => true]);
        Sanctum::actingAs($admin);

        // System Health Contract
        $healthResponse = $this->getJson('/api/v1/admin/system-health');
        $healthResponse->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'status',
                    'checked_at',
                    'application',
                    'database',
                    'cache',
                    'queue',
                    'storage',
                    'external_services',
                    'security_warnings',
                ],
            ]);

        // Settings Contract
        $settingsResponse = $this->getJson('/api/v1/admin/settings');
        $settingsResponse->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);
    }

    public function test_auth_and_profile_contracts(): void
    {
        $user = User::factory()->create([
            'first_name' => 'Alice',
            'last_name' => 'Integrity',
            'email' => 'alice.integrity@example.com',
            'user_type' => 'customer',
        ]);
        Sanctum::actingAs($user);

        // Auth Me Contract
        $meResponse = $this->getJson('/api/v1/auth/me');
        $meResponse->assertOk()
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'first_name',
                    'last_name',
                    'full_name',
                    'email',
                    'user_type',
                    'is_active',
                ],
            ]);
    }
}
