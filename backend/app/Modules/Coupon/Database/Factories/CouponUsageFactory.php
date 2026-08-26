<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Database\Factories;

use App\Modules\Auth\Models\User;
use App\Modules\Coupon\Models\Coupon;
use App\Modules\Coupon\Models\CouponUsage;
use App\Modules\Order\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class CouponUsageFactory
 *
 * @package App\Modules\Coupon\Database\Factories
 * @extends Factory<CouponUsage>
 */
class CouponUsageFactory extends Factory
{
    protected $model = CouponUsage::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'coupon_id' => Coupon::factory(),
            'user_id' => User::factory(),
            'order_id' => Order::factory(),
            'discount_amount' => 15.0000,
            'created_at' => now(),
        ];
    }
}
