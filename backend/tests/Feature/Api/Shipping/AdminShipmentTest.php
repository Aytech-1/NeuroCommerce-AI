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
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminShipmentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Warehouse $warehouse;
    protected Order $order;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->admin = User::where('email', 'admin@neurocommerce.test')->first() ?? User::factory()->create();
        $adminRole = Role::findByName('admin', 'api');
        $this->admin->assignRole($adminRole);
        $this->admin->givePermissionTo('shipping.view', 'shipping.create', 'shipping.update');

        $this->customer = User::factory()->create();
        $customerRole = Role::findByName('customer', 'api');
        $this->customer->assignRole($customerRole);

        $this->warehouse = Warehouse::factory()->create(['is_active' => true]);

        $this->order = Order::factory()->create([
            'user_id' => $this->customer->id,
            'status' => OrderStatus::PAID,
        ]);
    }

    public function test_admin_can_list_shipments_with_pagination(): void
    {
        Sanctum::actingAs($this->admin);

        Shipment::factory()->count(3)->create([
            'warehouse_id' => $this->warehouse->id,
        ]);

        $response = $this->getJson('/api/v1/admin/shipments');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => [
                        'id',
                        'order_id',
                        'warehouse_id',
                        'carrier',
                        'tracking_number',
                        'status',
                    ],
                ],
                'meta' => ['current_page', 'per_page', 'total', 'last_page'],
            ]);
    }

    public function test_admin_can_create_shipment_for_order(): void
    {
        Sanctum::actingAs($this->admin);

        $payload = [
            'warehouse_id' => (string) $this->warehouse->id,
            'carrier' => 'mock_carrier',
            'service_level' => 'Standard Ground',
            'weight' => 3.5,
            'cost' => 12.00,
        ];

        $response = $this->postJson("/api/v1/admin/orders/{$this->order->id}/shipment", $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.order_id', (string) $this->order->id)
            ->assertJsonPath('data.warehouse_id', (string) $this->warehouse->id)
            ->assertJsonPath('data.status', ShipmentStatus::LABEL_CREATED->value);

        $this->assertDatabaseHas('shipments', [
            'order_id' => $this->order->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => ShipmentStatus::LABEL_CREATED->value,
        ]);

        $this->assertDatabaseHas('ship_tracking_events', [
            'status' => ShipmentStatus::LABEL_CREATED->value,
        ]);
    }

    public function test_cannot_create_shipment_for_cancelled_order(): void
    {
        Sanctum::actingAs($this->admin);

        $cancelledOrder = Order::factory()->create([
            'user_id' => $this->customer->id,
            'status' => OrderStatus::CANCELLED,
        ]);

        $payload = [
            'warehouse_id' => (string) $this->warehouse->id,
            'carrier' => 'mock_carrier',
        ];

        $response = $this->postJson("/api/v1/admin/orders/{$cancelledOrder->id}/shipment", $payload);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'ORDER_NOT_FULFILLABLE');
    }

    public function test_admin_can_update_shipment_status_and_append_event(): void
    {
        Sanctum::actingAs($this->admin);

        $shipment = Shipment::factory()->create([
            'order_id' => $this->order->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => ShipmentStatus::LABEL_CREATED,
        ]);

        $payload = [
            'status' => ShipmentStatus::IN_TRANSIT->value,
            'location' => 'Memphis Sorting Hub',
            'description' => 'Departed sort facility',
        ];

        $response = $this->patchJson("/api/v1/admin/shipments/{$shipment->id}/status", $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', ShipmentStatus::IN_TRANSIT->value);

        $this->assertEquals(ShipmentStatus::IN_TRANSIT, $shipment->fresh()->status);
        $this->assertNotNull($shipment->fresh()->shipped_at);

        $this->assertDatabaseHas('ship_tracking_events', [
            'shipment_id' => $shipment->id,
            'status' => ShipmentStatus::IN_TRANSIT->value,
            'location' => 'Memphis Sorting Hub',
        ]);
    }
}
