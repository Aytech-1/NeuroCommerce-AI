<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Shipping;

use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Models\User;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Shipping\Enums\ShipmentStatus;
use App\Modules\Shipping\Models\Shipment;
use App\Modules\Shipping\Models\ShipTrackingEvent;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerShippingTrackingTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected User $otherCustomer;
    protected Warehouse $warehouse;
    protected Order $order;
    protected Shipment $shipment;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $customerRole = Role::findByName('customer', 'api');

        $this->customer = User::factory()->create();
        $this->customer->assignRole($customerRole);

        $this->otherCustomer = User::factory()->create();
        $this->otherCustomer->assignRole($customerRole);

        $this->warehouse = Warehouse::factory()->create(['is_active' => true]);

        $this->order = Order::factory()->create([
            'user_id' => $this->customer->id,
            'status' => OrderStatus::SHIPPED,
        ]);

        $this->shipment = Shipment::factory()->create([
            'order_id' => $this->order->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => ShipmentStatus::IN_TRANSIT,
            'tracking_number' => 'TRK-CUSTOMER-12345',
        ]);

        ShipTrackingEvent::factory()->create([
            'shipment_id' => $this->shipment->id,
            'status' => 'in_transit',
            'location' => 'Distribution Center',
            'description' => 'Scanned into transit',
            'occurred_at' => now(),
        ]);
    }

    public function test_customer_can_track_their_own_order(): void
    {
        Sanctum::actingAs($this->customer);

        $response = $this->getJson("/api/v1/customer/orders/{$this->order->id}/tracking");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_id', (string) $this->order->id)
            ->assertJsonPath('data.tracking_number', 'TRK-CUSTOMER-12345')
            ->assertJsonPath('data.status', ShipmentStatus::IN_TRANSIT->value)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'order_id',
                    'order_number',
                    'shipment_id',
                    'carrier',
                    'tracking_number',
                    'status',
                    'events' => [
                        '*' => ['id', 'status', 'location', 'description', 'occurred_at'],
                    ],
                ],
            ]);
    }

    public function test_customer_cannot_track_another_customers_order_idor(): void
    {
        Sanctum::actingAs($this->otherCustomer);

        $response = $this->getJson("/api/v1/customer/orders/{$this->order->id}/tracking");

        $response->assertStatus(403);
    }

    public function test_unauthenticated_request_to_tracking_returns_401(): void
    {
        $response = $this->getJson("/api/v1/customer/orders/{$this->order->id}/tracking");

        $response->assertStatus(401);
    }
}
