<?php

declare(strict_types=1);

namespace App\Modules\Admin\Database\Factories;

use App\Modules\Admin\Models\AnalyticsMonthlyReport;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class AnalyticsMonthlyReportFactory
 *
 * @extends Factory<AnalyticsMonthlyReport>
 */
class AnalyticsMonthlyReportFactory extends Factory
{
    protected $model = AnalyticsMonthlyReport::class;

    public function definition(): array
    {
        $orders = $this->faker->numberBetween(100, 1000);
        $revenue = $this->faker->randomFloat(4, 10000, 100000);

        return [
            'id' => (string) Str::orderedUuid(),
            'year_month' => $this->faker->unique()->dateTimeBetween('-1 year', 'now')->format('Y-m'),
            'total_revenue' => $revenue,
            'total_orders' => $orders,
            'total_new_customers' => (int) ($orders * 0.4),
            'total_returning_customers' => (int) ($orders * 0.6),
            'avg_order_value' => round($revenue / $orders, 4),
            'top_products' => [
                ['product_id' => (string) Str::orderedUuid(), 'revenue' => 4500.00, 'quantity' => 45],
            ],
            'top_categories' => [
                ['category_id' => (string) Str::orderedUuid(), 'revenue' => 12500.00],
            ],
            'conversion_rate' => 0.0350,
            'generated_at' => now(),
        ];
    }
}
