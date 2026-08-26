<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Database\Factories;

use App\Modules\Coupon\Enums\DiscountRuleType;
use App\Modules\Coupon\Models\Coupon;
use App\Modules\Coupon\Models\DiscountRule;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class DiscountRuleFactory
 *
 * @package App\Modules\Coupon\Database\Factories
 * @extends Factory<DiscountRule>
 */
class DiscountRuleFactory extends Factory
{
    protected $model = DiscountRule::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'coupon_id' => Coupon::factory(),
            'rule_type' => DiscountRuleType::MINIMUM_QUANTITY,
            'rule_entity_id' => null,
            'rule_value' => '2',
            'created_at' => now(),
        ];
    }
}
