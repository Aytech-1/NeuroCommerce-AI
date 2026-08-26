<?php

declare(strict_types=1);

namespace App\Modules\Admin\Database\Factories;

use App\Modules\Admin\Enums\CustomerSegment;
use App\Modules\Admin\Models\AnalyticsCustomer;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class AnalyticsCustomerFactory
 *
 * @extends Factory<AnalyticsCustomer>
 */
class AnalyticsCustomerFactory extends Factory
{
    protected $model = AnalyticsCustomer::class;

    public function definition(): array
    {
        $orders = $this->faker->numberBetween(1, 20);
        $spent = $orders * $this->faker->randomFloat(4, 30, 150);

        return [
            'id' => (string) Str::orderedUuid(),
            'user_id' => User::factory(),
            'total_orders' => $orders,
            'total_spent' => $spent,
            'avg_order_value' => round($spent / $orders, 4),
            'first_order_at' => $this->faker->dateTimeBetween('-1 year', '-1 month'),
            'last_order_at' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'customer_segment' => $this->faker->randomElement(CustomerSegment::cases()),
            'lifetime_value' => $spent,
        ];
    }
}
