<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Database\Factories;

use App\Modules\Coupon\Enums\CouponType;
use App\Modules\Coupon\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class CouponFactory
 *
 * @package App\Modules\Coupon\Database\Factories
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'code' => strtoupper($this->faker->unique()->lexify('PROMO???')),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'type' => CouponType::PERCENTAGE,
            'value' => 15.0000,
            'min_order_amount' => 50.0000,
            'max_discount_amount' => 100.0000,
            'usage_limit' => 100,
            'usage_limit_per_user' => 1,
            'times_used' => 0,
            'starts_at' => now()->subDay(),
            'expires_at' => now()->addMonths(2),
            'is_active' => true,
        ];
    }

    public function percentage(float $value = 20.0): self
    {
        return $this->state(fn () => [
            'type' => CouponType::PERCENTAGE,
            'value' => $value,
        ]);
    }

    public function fixed(float $value = 10.0): self
    {
        return $this->state(fn () => [
            'type' => CouponType::FIXED_AMOUNT,
            'value' => $value,
        ]);
    }

    public function freeShipping(): self
    {
        return $this->state(fn () => [
            'type' => CouponType::FREE_SHIPPING,
            'value' => 0.0,
        ]);
    }

    public function expired(): self
    {
        return $this->state(fn () => [
            'starts_at' => now()->subMonths(2),
            'expires_at' => now()->subDay(),
        ]);
    }

    public function exhausted(): self
    {
        return $this->state(fn () => [
            'usage_limit' => 5,
            'times_used' => 5,
        ]);
    }
}
