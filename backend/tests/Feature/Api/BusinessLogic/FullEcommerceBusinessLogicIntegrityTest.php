<?php

declare(strict_types=1);

namespace Tests\Feature\Api\BusinessLogic;

use App\Core\ValueObjects\Money;
use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\User;
use App\Modules\Cart\Models\Cart;
use App\Modules\Cart\Models\CartItem;
use App\Modules\Cart\Services\CartService;
use App\Modules\Catalog\Enums\ProductStatus;
use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use App\Modules\Coupon\Models\Coupon;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Services\InventoryService;
use App\Modules\Order\DTOs\CheckoutDTO;
use App\Modules\Order\Enums\InvoiceStatus;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Invoice;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Order\Services\CheckoutService;
use App\Modules\Order\Services\OrderStateMachine;
use App\Modules\Payment\DTOs\RefundDTO;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Enums\RefundStatus;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\Refund;
use App\Modules\Payment\Services\RefundService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FullEcommerceBusinessLogicIntegrityTest extends TestCase
{
    use RefreshDatabase;

    protected Warehouse $warehouse;
    protected User $customer;
    protected User $admin;
    protected Category $category;
    protected Brand $brand;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->warehouse = Warehouse::first() ?? Warehouse::factory()->create(['is_default' => true, 'is_active' => true]);
        $this->customer = User::factory()->create(['user_type' => 'customer', 'is_active' => true]);
        $this->admin = User::where('user_type', 'super_admin')->first() ?? User::factory()->create(['user_type' => 'super_admin', 'is_active' => true]);
        $this->category = Category::first() ?? Category::factory()->create(['is_active' => true]);
        $this->brand = Brand::first() ?? Brand::factory()->create(['is_active' => true]);
    }

    #[Test]
    public function rule_01_inactive_product_cannot_be_added_to_cart_or_purchased(): void
    {
        $inactiveProduct = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => false,
            'status' => ProductStatus::DRAFT,
            'base_price' => 15000.00,
        ]);

        Sanctum::actingAs($this->customer, ['*']);

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $inactiveProduct->id,
            'quantity' => 1,
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    #[Test]
    public function rule_02_inactive_variant_cannot_be_purchased(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'status' => ProductStatus::ACTIVE,
            'base_price' => 20000.00,
        ]);

        $inactiveVariant = ProductVariant::create([
            'product_id' => $product->id,
            'name' => 'Inactive Large',
            'sku' => 'SKU-VAR-INACTIVE',
            'is_active' => false,
            'price' => 22000.00,
            'stock_quantity' => 10,
        ]);

        Sanctum::actingAs($this->customer, ['*']);

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'variant_id' => $inactiveVariant->id,
            'quantity' => 1,
        ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function rule_03_inventory_cannot_be_oversold(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'status' => ProductStatus::ACTIVE,
            'base_price' => 10000.00,
        ]);

        InventoryItem::factory()->create([
            'product_id' => $product->id,
            'variant_id' => null,
            'warehouse_id' => $this->warehouse->id,
            'quantity_on_hand' => 2,
            'quantity_reserved' => 0,
        ]);

        Sanctum::actingAs($this->customer, ['*']);

        // Attempt to add quantity of 5 when only 2 available
        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $response->assertStatus(422);
    }

    #[Test]
    public function rule_04_inventory_reservation_adjusts_reserved_quantities_safely(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'status' => ProductStatus::ACTIVE,
            'base_price' => 12000.00,
        ]);

        $invItem = InventoryItem::factory()->create([
            'product_id' => $product->id,
            'warehouse_id' => $this->warehouse->id,
            'quantity_on_hand' => 10,
            'quantity_reserved' => 0,
        ]);

        /** @var InventoryService $inventoryService */
        $inventoryService = app(InventoryService::class);

        $reservationId = $inventoryService->reserveStock([
            ['product_id' => $product->id, 'quantity' => 4, 'warehouse_id' => $this->warehouse->id]
        ], ttlMinutes: 15);

        $this->assertNotEmpty($reservationId);
        $invItem->refresh();
        $this->assertEquals(4, $invItem->quantity_reserved);
        $this->assertEquals(6, $invItem->quantity_available);

        // Releasing reservation restores available stock
        $inventoryService->releaseStock($reservationId, 'Test cancellation');
        $invItem->refresh();
        $this->assertEquals(0, $invItem->quantity_reserved);
        $this->assertEquals(10, $invItem->quantity_available);
    }

    #[Test]
    public function rule_05_cart_ownership_and_scoping_is_enforced(): void
    {
        $customerA = User::factory()->create(['user_type' => 'customer', 'is_active' => true]);
        $customerB = User::factory()->create(['user_type' => 'customer', 'is_active' => true]);

        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'status' => ProductStatus::ACTIVE,
            'base_price' => 5000.00,
        ]);

        InventoryItem::factory()->create([
            'product_id' => $product->id,
            'warehouse_id' => $this->warehouse->id,
            'quantity_on_hand' => 10,
            'quantity_reserved' => 0,
        ]);

        // Customer A adds item to cart
        Sanctum::actingAs($customerA, ['*']);
        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
        ])->assertStatus(201);

        // Customer B checks their cart and must see empty items
        Sanctum::actingAs($customerB, ['*']);
        $cartBResponse = $this->getJson('/api/v1/cart');
        $cartBResponse->assertStatus(200);
        $this->assertCount(0, $cartBResponse->json('data.items'));
    }

    #[Test]
    public function rule_06_server_side_pricing_is_authoritative_over_client_input(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'status' => ProductStatus::ACTIVE,
            'base_price' => 75000.00,
        ]);

        InventoryItem::factory()->create([
            'product_id' => $product->id,
            'warehouse_id' => $this->warehouse->id,
            'quantity_on_hand' => 5,
            'quantity_reserved' => 0,
        ]);

        Sanctum::actingAs($this->customer, ['*']);

        // Client attempts to spoof unit_price of 1.00
        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 1,
            'unit_price' => 1.00,
            'price' => 1.00,
        ]);

        $response->assertStatus(201);
        $this->assertEquals(75000.00, (float) $response->json('data.unit_price'));
    }

    #[Test]
    public function rule_08_expired_coupon_is_rejected_at_validation(): void
    {
        $coupon = Coupon::factory()->create([
            'code' => 'EXPIRED50',
            'type' => 'percentage',
            'value' => 50,
            'starts_at' => now()->subDays(10),
            'expires_at' => now()->subDays(1),
            'is_active' => true,
        ]);

        Sanctum::actingAs($this->customer, ['*']);

        $response = $this->postJson('/api/v1/cart/coupon', [
            'code' => 'EXPIRED50',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    #[Test]
    public function rule_10_checkout_calculates_authoritative_totals_and_records_invoice(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'status' => ProductStatus::ACTIVE,
            'base_price' => 30000.00,
        ]);

        InventoryItem::factory()->create([
            'product_id' => $product->id,
            'warehouse_id' => $this->warehouse->id,
            'quantity_on_hand' => 10,
            'quantity_reserved' => 0,
        ]);

        Sanctum::actingAs($this->customer, ['*']);

        // Add to cart
        $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertStatus(201);

        // Process checkout
        $checkoutResponse = $this->postJson('/api/v1/checkout', [
            'payment_method' => 'stripe',
            'payment_token' => 'tok_mock_success',
            'shipping_address' => [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'address_line_1' => '10 Innovation Way',
                'city' => 'Victoria Island',
                'state_province' => 'Lagos',
                'postal_code' => '101241',
                'country_code' => 'NG',
                'phone' => '+2348000000000',
            ],
            'billing_address' => [
                'first_name' => 'John',
                'last_name' => 'Doe',
                'address_line_1' => '10 Innovation Way',
                'city' => 'Victoria Island',
                'state_province' => 'Lagos',
                'postal_code' => '101241',
                'country_code' => 'NG',
            ],
        ]);

        $checkoutResponse->assertSuccessful();

        $orderData = $checkoutResponse->json('data.order');
        $this->assertEquals(60000.00, (float) $orderData['subtotal']);
        $this->assertEquals(60000.00, (float) $orderData['total_amount']);

        // Verify invoice was created linked to order
        $orderId = $orderData['id'];
        $invoice = Invoice::where('order_id', $orderId)->first();
        $this->assertNotNull($invoice);
        $this->assertEquals(60000.00, (float) $invoice->total_amount);
        $this->assertEquals(InvoiceStatus::PAID, $invoice->status);
    }

    #[Test]
    public function rule_15_invalid_order_state_transitions_are_rejected(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->customer->id,
            'status' => OrderStatus::DELIVERED,
        ]);

        /** @var OrderStateMachine $stateMachine */
        $stateMachine = app(OrderStateMachine::class);

        $this->expectException(\App\Core\Exceptions\BusinessRuleException::class);
        $this->expectExceptionMessage("Illegal order state transition from 'delivered' to 'processing'.");

        $stateMachine->transition($order, OrderStatus::PROCESSING);
    }

    #[Test]
    public function rule_17_customer_cannot_access_another_customers_order(): void
    {
        $customerA = User::factory()->create(['user_type' => 'customer', 'is_active' => true]);
        $customerB = User::factory()->create(['user_type' => 'customer', 'is_active' => true]);

        $orderB = Order::factory()->create([
            'user_id' => $customerB->id,
            'status' => OrderStatus::PENDING,
        ]);

        Sanctum::actingAs($customerA, ['*']);

        $response = $this->getJson("/api/v1/customer/orders/{$orderB->id}");
        $response->assertStatus(403);
    }

    #[Test]
    public function rule_20_duplicate_refund_exceeding_payment_is_prevented(): void
    {
        $order = Order::factory()->create([
            'user_id' => $this->customer->id,
            'status' => OrderStatus::PAID,
            'total_amount' => 50000.00,
        ]);

        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'amount' => 50000.00,
            'status' => PaymentStatus::COMPLETED,
            'gateway' => 'mock_stripe',
        ]);

        /** @var RefundService $refundService */
        $refundService = app(RefundService::class);

        // First full refund of 50,000
        $refundDTO1 = new RefundDTO(
            payment: $payment,
            amount: 50000.00,
            reason: 'Customer requested return',
            processedBy: $this->admin->id
        );
        $refund1 = $refundService->processRefund($refundDTO1);
        $this->assertNotNull($refund1);

        // Attempt second refund of 1,000 on already fully refunded payment
        $refundDTO2 = new RefundDTO(
            payment: $payment,
            amount: 1000.00,
            reason: 'Double refund attempt',
            processedBy: $this->admin->id
        );

        $this->expectException(\App\Core\Exceptions\BusinessRuleException::class);
        $refundService->processRefund($refundDTO2);
    }
}
