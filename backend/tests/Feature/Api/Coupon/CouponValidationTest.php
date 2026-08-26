<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Coupon;

use App\Modules\Coupon\Models\Coupon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_valid_coupon_code_returns_preview_discount(): void
    {
        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'WELCOME10',
            'subtotal' => 100.00,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.is_valid', true)
            ->assertJsonPath('data.code', 'WELCOME10')
            ->assertJsonPath('data.discount_amount', fn ($val) => (float) $val === 10.0);
    }

    public function test_expired_coupon_returns_422_error(): void
    {
        Coupon::factory()->expired()->create([
            'code' => 'EXPIRED99',
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'EXPIRED99',
            'subtotal' => 100.00,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'COUPON_EXPIRED');
    }

    public function test_inactive_coupon_returns_422_error(): void
    {
        Coupon::factory()->create([
            'code' => 'DISABLED10',
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'DISABLED10',
            'subtotal' => 100.00,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'COUPON_INACTIVE');
    }

    public function test_minimum_spend_not_met_returns_422(): void
    {
        // SAVE25 has min_order_amount = 100.00
        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'SAVE25',
            'subtotal' => 45.00,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'COUPON_MIN_ORDER_NOT_MET');
    }

    public function test_nonexistent_coupon_returns_422_error(): void
    {
        $response = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'DOESNOTEXIST',
            'subtotal' => 100.00,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('code', 'COUPON_NOT_FOUND');
    }
}
