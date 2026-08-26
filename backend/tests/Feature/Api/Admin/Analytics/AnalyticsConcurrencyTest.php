<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin\Analytics;

use App\Modules\Admin\Models\AnalyticsDailySales;
use App\Modules\Admin\Models\AnalyticsKpi;
use App\Modules\Admin\Services\AnalyticsAggregationService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_repeated_aggregation_is_idempotent_and_does_not_create_duplicate_daily_sales(): void
    {
        $service = app(AnalyticsAggregationService::class);
        $dateStr = now()->subDays(2)->toDateString();

        $service->aggregateDailySales($dateStr);
        $service->aggregateDailySales($dateStr);

        $count = AnalyticsDailySales::where('date', $dateStr)->count();
        $this->assertEquals(1, $count);
    }

    public function test_repeated_kpi_materialization_upserts_without_duplicates(): void
    {
        $service = app(AnalyticsAggregationService::class);

        $service->materializeKpis();
        $service->materializeKpis();

        $todayStr = now()->toDateString();
        $count = AnalyticsKpi::where('metric_name', 'total_revenue')
            ->where('period_value', $todayStr)
            ->count();

        $this->assertEquals(1, $count);
    }
}
