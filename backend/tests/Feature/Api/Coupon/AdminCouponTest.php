<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Coupon;

use App\Modules\Auth\Models\Role;
use App\Modules\Auth\Models\User;
use App\Modules\Coupon\Models\Coupon;
use App\Modules\Coupon\Models\CouponUsage;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCouponTest extends TestCase
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
        $this->admin->givePermissionTo('coupon.view', 'coupon.create', 'coupon.update', 'coupon.delete');
    }

    public function test_admin_can_list_coupons_with_pagination(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/v1/admin/coupons');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'code',
                        'name',
                        'type',
                        'value',
                        'is_active',
                        'times_used',
                    ],
                ],
                'meta' => ['current_page', 'per_page', 'total'],
            ]);
    }

    public function test_admin_can_create_coupon(): void
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/v1/admin/coupons', [
            'code' => 'SUMMER30',
            'name' => 'Summer Sale 30%',
            'description' => 'Special 30% discount on summer items',
            'type' => 'percentage',
            'value' => 30.0,
            'min_order_amount' => 50.0,
            'max_discount_amount' => 100.0,
            'usage_limit' => 200,
            'usage_limit_per_user' => 1,
            'starts_at' => now()->toIso8601String(),
            'expires_at' => now()->addMonths(2)->toIso8601String(),
            'is_active' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.code', 'SUMMER30')
            ->assertJsonPath('data.value', fn ($v) => (float) $v === 30.0);

        $this->assertDatabaseHas('coupons', [
            'code' => 'SUMMER30',
            'name' => 'Summer Sale 30%',
        ]);
    }

    public function test_admin_can_update_and_delete_coupon(): void
    {
        Sanctum::actingAs($this->admin);

        /** @var Coupon $coupon */
        $coupon = Coupon::first();

        $updateResponse = $this->putJson("/api/v1/admin/coupons/{$coupon->id}", [
            'name' => 'Updated Promotion Name',
            'value' => 25.0,
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Updated Promotion Name');

        $this->assertDatabaseHas('coupons', [
            'id' => $coupon->id,
            'name' => 'Updated Promotion Name',
        ]);

        $deleteResponse = $this->deleteJson("/api/v1/admin/coupons/{$coupon->id}");
        $deleteResponse->assertStatus(204);

        $this->assertSoftDeleted('coupons', [
            'id' => $coupon->id,
        ]);
    }

    public function test_admin_can_view_coupon_usage_history(): void
    {
        Sanctum::actingAs($this->admin);

        /** @var Coupon $coupon */
        $coupon = Coupon::first();

        $response = $this->getJson("/api/v1/admin/coupons/{$coupon->id}/usage");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data',
                'meta' => ['current_page', 'per_page', 'total'],
            ]);
    }
}
