<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Shipping;

use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Models\User;
use App\Modules\Shipping\Models\ShipRate;
use App\Modules\Shipping\Models\ShipZone;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminShippingZoneAndMethodTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->admin = User::where('email', 'admin@neurocommerce.test')->first() ?? User::factory()->create();
        $adminRole = Role::findByName('admin', 'api');
        $this->admin->assignRole($adminRole);
        $this->admin->givePermissionTo('shipping.view', 'shipping.create', 'shipping.update');
    }

    public function test_admin_can_list_and_create_shipping_zones(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/admin/shipping-zones');
        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $createResponse = $this->postJson('/api/v1/admin/shipping-zones', [
            'name' => 'Asia Pacific',
            'is_active' => true,
            'country_codes' => ['JP', 'KR', 'SG'],
        ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Asia Pacific');

        $this->assertDatabaseHas('ship_zones', [
            'name' => 'Asia Pacific',
        ]);
        $this->assertDatabaseHas('ship_zone_countries', [
            'country_code' => 'JP',
        ]);
    }

    public function test_admin_can_list_and_create_shipping_methods(): void
    {
        Sanctum::actingAs($this->admin);

        /** @var ShipZone $zone */
        $zone = ShipZone::first();

        $createResponse = $this->postJson('/api/v1/admin/shipping-methods', [
            'zone_id' => (string) $zone->id,
            'carrier' => 'mock_carrier',
            'service_level' => 'Next Day Air',
            'min_weight' => 0.0,
            'max_weight' => 15.0,
            'rate' => 25.00,
            'currency_code' => 'USD',
            'estimated_days_min' => 1,
            'estimated_days_max' => 1,
        ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.service_level', 'Next Day Air');

        $this->assertDatabaseHas('ship_rates', [
            'zone_id' => $zone->id,
            'service_level' => 'Next Day Air',
        ]);
    }
}
