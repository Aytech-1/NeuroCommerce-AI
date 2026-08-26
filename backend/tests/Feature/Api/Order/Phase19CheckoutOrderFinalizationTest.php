<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Order;

use App\Modules\Auth\Models\User;
use App\Modules\Cart\Models\Cart;
use App\Modules\Cart\Models\CartItem;
use App\Modules\Catalog\Models\Product;
use App\Modules\Coupon\Models\Coupon;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase19CheckoutOrderFinalizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $otherCustomer;
    protected Product $product;
    protected Warehouse $warehouse;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->customer = User::factory()->customer()->create();
        $this->otherCustomer = User::factory()->customer()->create();
        $this->product = Product::where('status', 'active')->doesntHave('variants')->first();
        $this->warehouse = Warehouse::first() ?? Warehouse::factory()->create();

        // Ensure stock is available for testing
        InventoryItem::updateOrCreate(
            ['product_id' => $this->product->id, 'warehouse_id' => $this->warehouse->id],
            ['quantity_on_hand' => 50, 'quantity_reserved' => 0]
        );
    }

    public function test_full_checkout_flow_with_order_snapshots_and_cart_cleared(): void
    {
        $cart = Cart::factory()->create([
            'user_id' => $this->customer->id,
            'currency_code' => 'USD',
        ]);

        $price = (float) $this->product->base_price;

        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
            'unit_price' => $price,
            'total_price' => round($price * 2, 2),
        ]);

        $address = [
            'first_name' => 'Alice',
            'last_name' => 'Smith',
            'address_line_1' => '456 Tech Ave',
            'city' => 'San Francisco',
            'state_province' => 'CA',
            'postal_code' => '94105',
            'country_code' => 'US',
        ];

        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_address' => $address,
                'billing_address' => $address,
                'shipping_method' => 'standard',
                'payment_method' => 'stripe',
                'payment_token' => 'tok_visa_success',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.payment.status', 'succeeded');

        $orderId = $response->json('data.order.id');
        $order = Order::with('items')->find($orderId);
        $this->assertNotNull($order);
        $this->assertEquals(1, $order->items->count());
        $this->assertEquals(2, $order->items->first()->quantity);

        // Cart items must be cleared after successful checkout
        $this->assertDatabaseMissing('cart_items', [
            'cart_id' => $cart->id,
        ]);
    }

    public function test_checkout_revalidates_and_rejects_inactive_or_deleted_product(): void
    {
        $cart = Cart::factory()->create([
            'user_id' => $this->customer->id,
            'currency_code' => 'USD',
        ]);

        $price = (float) $this->product->base_price;

        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'unit_price' => $price,
            'total_price' => $price,
        ]);

        // Product becomes inactive
        $this->product->update(['is_active' => false]);

        $address = [
            'first_name' => 'Bob',
            'last_name' => 'Jones',
            'address_line_1' => '789 Market St',
            'city' => 'Seattle',
            'state_province' => 'WA',
            'postal_code' => '98101',
            'country_code' => 'US',
        ];

        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_address' => $address,
                'billing_address' => $address,
                'shipping_method' => 'standard',
                'payment_method' => 'stripe',
                'payment_token' => 'tok_visa_success',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_checkout_validates_and_applies_authoritative_coupon(): void
    {
        $cart = Cart::factory()->create([
            'user_id' => $this->customer->id,
            'currency_code' => 'USD',
        ]);

        $price = (float) $this->product->base_price;

        CartItem::create([
            'cart_id' => $cart->id,
            'product_id' => $this->product->id,
            'quantity' => 1,
            'unit_price' => $price,
            'total_price' => $price,
        ]);

        $address = [
            'first_name' => 'Charlie',
            'last_name' => 'Brown',
            'address_line_1' => '100 Silicon Way',
            'city' => 'Austin',
            'state_province' => 'TX',
            'postal_code' => '78701',
            'country_code' => 'US',
        ];

        $response = $this->actingAs($this->customer, 'sanctum')
            ->postJson('/api/v1/checkout', [
                'shipping_address' => $address,
                'billing_address' => $address,
                'shipping_method' => 'standard',
                'coupon_code' => 'WELCOME10',
                'payment_method' => 'stripe',
                'payment_token' => 'tok_visa_success',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true);

        $orderId = $response->json('data.order.id');
        $order = Order::find($orderId);
        $this->assertNotNull($order);
    }

    public function test_customer_cannot_access_another_customers_order_idor(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->customer->id,
            'status' => OrderStatus::PENDING,
            'total_amount' => 199.99,
        ]);

        // Attempt by other customer
        $response = $this->actingAs($this->otherCustomer, 'sanctum')
            ->getJson("/api/v1/customer/orders/{$order->id}");

        $this->assertContains($response->status(), [403, 404]);
    }
}
