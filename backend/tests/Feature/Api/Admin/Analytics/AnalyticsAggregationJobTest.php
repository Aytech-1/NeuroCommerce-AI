<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin\Analytics;

use App\Modules\Admin\Jobs\GenerateDailySalesReportsJob;
use App\Modules\Admin\Models\AnalyticsDailySales;
use App\Modules\Admin\Models\AnalyticsKpi;
use App\Modules\Admin\Services\AnalyticsAggregationService;
use App\Modules\Auth\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsAggregationJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_aggregation_job_processes_nightly_sales_and_kpis(): void
    {
        $user = User::factory()->customer()->create();

        Order::factory()->create([
            'user_id' => $user->id,
            'status' => OrderStatus::DELIVERED,
            'total_amount' => 250.00,
            'created_at' => now()->subDay(),
        ]);

        $service = app(AnalyticsAggregationService::class);
        $job = new GenerateDailySalesReportsJob(now()->subDay()->toDateString());
        $job->handle($service);

        $this->assertDatabaseHas('analytics_daily_sales', [
            'date' => now()->subDay()->toDateString(),
        ]);

        $this->assertDatabaseHas('analytics_kpis', [
            'metric_name' => 'total_revenue',
        ]);
    }
}
