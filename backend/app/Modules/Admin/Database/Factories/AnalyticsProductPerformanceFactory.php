<?php

declare(strict_types=1);

namespace App\Modules\Admin\Database\Factories;

use App\Modules\Admin\Models\AnalyticsProductPerformance;
use App\Modules\Catalog\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class AnalyticsProductPerformanceFactory
 *
 * @extends Factory<AnalyticsProductPerformance>
 */
class AnalyticsProductPerformanceFactory extends Factory
{
    protected $model = AnalyticsProductPerformance::class;

    public function definition(): array
    {
        $views = $this->faker->numberBetween(50, 1000);
        $purchases = $this->faker->numberBetween(1, (int) ($views * 0.1));
        $revenue = $purchases * $this->faker->randomFloat(4, 20, 200);

        return [
            'id' => (string) Str::orderedUuid(),
            'date' => $this->faker->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'product_id' => Product::factory(),
            'views' => $views,
            'add_to_cart_count' => (int) ($views * 0.2),
            'purchase_count' => $purchases,
            'revenue' => $revenue,
            'conversion_rate' => $views > 0 ? round($purchases / $views, 4) : 0.0000,
        ];
    }
}
