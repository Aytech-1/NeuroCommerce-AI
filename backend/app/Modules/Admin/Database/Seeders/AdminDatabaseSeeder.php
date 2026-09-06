<?php

declare(strict_types=1);

namespace App\Modules\Admin\Database\Seeders;

use App\Modules\Admin\Enums\KpiPeriodType;
use App\Modules\Admin\Models\AnalyticsDailySales;
use App\Modules\Admin\Models\AnalyticsKpi;
use App\Modules\Admin\Models\AnalyticsTraffic;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

/**
 * Class AdminDatabaseSeeder
 *
 * @package App\Modules\Admin\Database\Seeders
 */
class AdminDatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $now = CarbonImmutable::now();

        // Seed 30 days of daily sales and traffic
        for ($i = 30; $i >= 0; $i--) {
            $date = $now->subDays($i)->toDateString();

            AnalyticsDailySales::updateOrCreate(
                ['date' => $date],
                [
                    'total_orders' => rand(10, 50),
                    'total_revenue' => rand(2250000, 11250000),
                    'total_tax' => rand(180000, 900000),
                    'total_shipping' => rand(75000, 375000),
                    'total_discounts' => rand(112500, 562500),
                    'net_revenue' => rand(1800000, 9000000),
                    'avg_order_value' => rand(180000, 270000),
                    'total_items_sold' => rand(20, 120),
                    'unique_customers' => rand(8, 40),
                    'new_customers' => rand(3, 15),
                    'returning_customers' => rand(5, 25),
                    'refund_count' => 0,
                    'refund_amount' => 0.0000,
                    'currency_code' => 'NGN',
                ]
            );

            AnalyticsTraffic::updateOrCreate(
                [
                    'date' => $date,
                    'source' => 'direct',
                    'device_type' => 'desktop',
                ],
                [
                    'page_views' => rand(500, 2000),
                    'unique_visitors' => rand(300, 1200),
                    'sessions' => rand(400, 1500),
                    'avg_session_duration' => rand(120, 300),
                    'bounce_rate' => 0.3500,
                ]
            );
        }

        // Seed current KPIs
        AnalyticsKpi::updateOrCreate(
            [
                'metric_name' => 'total_revenue',
                'period_type' => KpiPeriodType::DAILY,
                'period_value' => $now->toDateString(),
            ],
            [
                'metric_value' => 222750000.0000,
                'metadata' => ['currency' => 'NGN'],
            ]
        );

        AnalyticsKpi::updateOrCreate(
            [
                'metric_name' => 'total_orders',
                'period_type' => KpiPeriodType::DAILY,
                'period_value' => $now->toDateString(),
            ],
            [
                'metric_value' => 1240.0000,
            ]
        );
    }
}
