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

class ShippingLifecycleTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected Warehouse $warehouse;
    protected Order $order;
    protected Shipment $shipment;

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

        $this->shipment = Shipment::factory()->create([
            'order_id' => $this->order->id,
            'warehouse_id' => $this->warehouse->id,
            'status' => ShipmentStatus::LABEL_CREATED,
        ]);
    }

    public function test_shipment_in_transit_advances_order_to_shipped(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->patchJson("/api/v1/admin/shipments/{$this->shipment->id}/status", [
            'status' => ShipmentStatus::IN_TRANSIT->value,
            'description' => 'Carrier scanned package into sorting center',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', ShipmentStatus::IN_TRANSIT->value);

        $this->assertEquals(OrderStatus::SHIPPED, $this->order->fresh()->status);
    }

    public function test_shipment_delivered_advances_order_to_delivered(): void
    {
        Sanctum::actingAs($this->admin);

        $this->shipment->update(['status' => ShipmentStatus::IN_TRANSIT]);

        $response = $this->patchJson("/api/v1/admin/shipments/{$this->shipment->id}/status", [
            'status' => ShipmentStatus::DELIVERED->value,
            'description' => 'Package delivered to front porch',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', ShipmentStatus::DELIVERED->value);

        $this->assertEquals(OrderStatus::DELIVERED, $this->order->fresh()->status);
        $this->assertNotNull($this->shipment->fresh()->delivered_at);
    }

    public function test_invalid_state_transition_is_rejected(): void
    {
        Sanctum::actingAs($this->admin);

        $this->shipment->update(['status' => ShipmentStatus::DELIVERED]);

        $response = $this->patchJson("/api/v1/admin/shipments/{$this->shipment->id}/status", [
            'status' => ShipmentStatus::PENDING->value,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'INVALID_SHIPMENT_TRANSITION');
    }
}
