<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Review;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Shared\Enums\OrderStatus;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerifiedPurchaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_customer_with_completed_order_gets_verified_purchase_badge(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'status' => OrderStatus::DELIVERED->value,
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 5,
            'title' => 'Verified Review',
            'body' => 'Bought and received it!',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.is_verified_purchase', true);

        $this->assertDatabaseHas('reviews', [
            'product_id' => $product->id,
            'user_id' => $customer->id,
            'is_verified_purchase' => true,
            'order_id' => $order->id,
        ]);
    }

    public function test_customer_without_purchases_does_not_get_verified_badge(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 4,
            'title' => 'Unverified Review',
            'body' => 'Did not purchase here.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.is_verified_purchase', false);

        $this->assertDatabaseHas('reviews', [
            'product_id' => $product->id,
            'user_id' => $customer->id,
            'is_verified_purchase' => false,
            'order_id' => null,
        ]);
    }

    public function test_client_cannot_forge_verified_purchase_or_order_id(): void
    {
        $customer = User::factory()->customer()->create();
        $otherCustomer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        // Foreign order belonging to someone else
        $foreignOrder = Order::factory()->create([
            'user_id' => $otherCustomer->id,
            'status' => OrderStatus::DELIVERED->value,
        ]);
        OrderItem::factory()->create([
            'order_id' => $foreignOrder->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 5,
            'title' => 'Forged Attempt',
            'body' => 'Trying to forge verified badge',
            'is_verified_purchase' => true,
            'order_id' => $foreignOrder->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.is_verified_purchase', false);

        $this->assertDatabaseHas('reviews', [
            'product_id' => $product->id,
            'user_id' => $customer->id,
            'is_verified_purchase' => false,
            'order_id' => null,
        ]);
    }

    public function test_cancelled_orders_do_not_grant_verified_purchase_status(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'status' => OrderStatus::CANCELLED->value,
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($customer, 'sanctum')->postJson("/api/v1/products/{$product->id}/reviews", [
            'rating' => 1,
            'title' => 'Cancelled Order Review',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.is_verified_purchase', false);
    }
}
