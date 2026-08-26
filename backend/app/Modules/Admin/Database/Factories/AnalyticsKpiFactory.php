<?php

declare(strict_types=1);

namespace App\Modules\Admin\Database\Factories;

use App\Modules\Admin\Enums\KpiPeriodType;
use App\Modules\Admin\Models\AnalyticsKpi;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class AnalyticsKpiFactory
 *
 * @extends Factory<AnalyticsKpi>
 */
class AnalyticsKpiFactory extends Factory
{
    protected $model = AnalyticsKpi::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::orderedUuid(),
            'metric_name' => $this->faker->randomElement(['total_revenue', 'total_orders', 'total_customers', 'avg_order_value']),
            'metric_value' => $this->faker->randomFloat(4, 100, 50000),
            'period_type' => KpiPeriodType::DAILY,
            'period_value' => now()->toDateString(),
            'metadata' => ['computed_by' => 'scheduler'],
        ];
    }
}
