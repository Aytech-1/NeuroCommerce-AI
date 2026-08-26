<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Coupon;

use App\Core\Exceptions\BusinessRuleException;
use App\Modules\Auth\Models\User;
use App\Modules\Coupon\Models\Coupon;
use App\Modules\Coupon\Services\CouponService;
use App\Modules\Order\Models\Order;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CouponUsageLimitTest extends TestCase
{
    use RefreshDatabase;

    protected CouponService $couponService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->couponService = app(CouponService::class);
    }

    public function test_global_usage_limit_exhaustion_blocks_further_redemptions(): void
    {
        $coupon = Coupon::factory()->create([
            'code' => 'LIMITED1',
            'usage_limit' => 1,
            'times_used' => 0,
            'value' => 10.0,
        ]);

        $user1 = User::factory()->create();
        $order1 = Order::factory()->create(['user_id' => $user1->id]);

        // First redemption succeeds
        $this->couponService->recordUsage((string) $coupon->id, (string) $user1->id, (string) $order1->id, 10.0);

        $coupon->refresh();
        $this->assertEquals(1, $coupon->times_used);

        // Second redemption fails with business rule exception
        $user2 = User::factory()->create();
        $order2 = Order::factory()->create(['user_id' => $user2->id]);

        $this->expectException(BusinessRuleException::class);
        $this->expectExceptionMessage('Coupon usage limit reached.');

        $this->couponService->recordUsage((string) $coupon->id, (string) $user2->id, (string) $order2->id, 10.0);
    }

    public function test_per_user_limit_enforcement(): void
    {
        $coupon = Coupon::factory()->create([
            'code' => 'ONEPERUSER',
            'usage_limit' => 100,
            'usage_limit_per_user' => 1,
            'value' => 10.0,
        ]);

        $user = User::factory()->create();
        $order1 = Order::factory()->create(['user_id' => $user->id]);

        $this->couponService->recordUsage((string) $coupon->id, (string) $user->id, (string) $order1->id, 10.0);

        // Validation for second order by same user fails
        $validation = $this->couponService->validateCoupon(
            code: 'ONEPERUSER',
            subtotal: 100.0,
            userId: (string) $user->id
        );

        $this->assertFalse($validation->isValid);
        $this->assertEquals('COUPON_USER_LIMIT_REACHED', $validation->errorCode);
    }
}
