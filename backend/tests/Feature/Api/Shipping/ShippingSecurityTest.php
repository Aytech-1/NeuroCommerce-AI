<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Shipping;

use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ShippingSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->customer = User::factory()->create();
        $customerRole = Role::findByName('customer', 'api');
        $this->customer->assignRole($customerRole);
    }

    public function test_customer_cannot_access_admin_shipments_endpoints(): void
    {
        Sanctum::actingAs($this->customer);

        $this->getJson('/api/v1/admin/shipments')->assertStatus(403);
        $this->getJson('/api/v1/admin/shipping-methods')->assertStatus(403);
        $this->getJson('/api/v1/admin/shipping-zones')->assertStatus(403);
    }

    public function test_unauthenticated_request_to_admin_shipments_returns_401(): void
    {
        $this->getJson('/api/v1/admin/shipments')->assertStatus(401);
        $this->getJson('/api/v1/admin/shipping-methods')->assertStatus(401);
        $this->getJson('/api/v1/admin/shipping-zones')->assertStatus(401);
    }
}
