<?php

declare(strict_types=1);

namespace App\Modules\Admin\Database\Factories;

use App\Modules\Admin\Models\AnalyticsTraffic;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Class AnalyticsTrafficFactory
 *
 * @extends Factory<AnalyticsTraffic>
 */
class AnalyticsTrafficFactory extends Factory
{
    protected $model = AnalyticsTraffic::class;

    public function definition(): array
    {
        return [
            'id' => (string) Str::orderedUuid(),
            'date' => $this->faker->dateTimeBetween('-30 days', 'now')->format('Y-m-d'),
            'page_views' => $this->faker->numberBetween(100, 5000),
            'unique_visitors' => $this->faker->numberBetween(50, 2000),
            'sessions' => $this->faker->numberBetween(60, 2500),
            'avg_session_duration' => $this->faker->numberBetween(30, 300),
            'bounce_rate' => $this->faker->randomFloat(4, 0.2, 0.6),
            'source' => $this->faker->randomElement(['organic', 'direct', 'referral', 'social', 'paid']),
            'device_type' => $this->faker->randomElement(['desktop', 'mobile', 'tablet']),
        ];
    }
}
