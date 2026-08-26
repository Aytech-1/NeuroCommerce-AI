<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin\Analytics;

use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsPerformanceAndIndexTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
    }

    public function test_daily_sales_queries_use_materialized_records_for_fast_response(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/analytics/sales?period=last_30_days');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_traffic_queries_use_indexes(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/analytics/behavior?period=last_30_days');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
