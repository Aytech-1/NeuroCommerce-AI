<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Coupon;

use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Models\User;
use App\Modules\Coupon\Models\Coupon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CouponSecurityTest extends TestCase
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

    public function test_customer_cannot_access_admin_coupons_endpoints(): void
    {
        Sanctum::actingAs($this->customer);

        $response = $this->getJson('/api/v1/admin/coupons');
        $response->assertStatus(403);

        $postResponse = $this->postJson('/api/v1/admin/coupons', [
            'code' => 'HACK100',
            'name' => '100% Free',
            'type' => 'percentage',
            'value' => 100.0,
        ]);
        $postResponse->assertStatus(403);
    }

    public function test_unauthenticated_request_to_admin_coupons_returns_401(): void
    {
        $response = $this->getJson('/api/v1/admin/coupons');
        $response->assertStatus(401);
    }
}
