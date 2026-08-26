<?php

declare(strict_types=1);

namespace App\Modules\Admin\Database\Factories;

use App\Modules\Admin\Models\AnalyticsDailySales;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class AnalyticsDailySalesFactory
 *
 * @extends Factory<AnalyticsDailySales>
 */
class AnalyticsDailySalesFactory extends Factory
{
    protected $model = AnalyticsDailySales::class;

    public function definition(): array
    {
        $orders = $this->faker->numberBetween(5, 100);
        $revenue = $this->faker->randomFloat(4, 500, 10000);
        $tax = round($revenue * 0.08, 4);
        $shipping = round($orders * 5.0, 4);
        $discounts = round($revenue * 0.05, 4);
        $net = round($revenue - $tax - $shipping, 4);

        return [
            'id' => (string) Str::orderedUuid(),
            'date' => $this->faker->unique()->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'total_orders' => $orders,
            'total_revenue' => $revenue,
            'total_tax' => $tax,
            'total_shipping' => $shipping,
            'total_discounts' => $discounts,
            'net_revenue' => $net,
            'avg_order_value' => round($revenue / $orders, 4),
            'total_items_sold' => $orders * 2,
            'unique_customers' => (int) ($orders * 0.8),
            'new_customers' => (int) ($orders * 0.4),
            'returning_customers' => (int) ($orders * 0.4),
            'refund_count' => 0,
            'refund_amount' => 0.0000,
            'currency_code' => 'USD',
        ];
    }
}
