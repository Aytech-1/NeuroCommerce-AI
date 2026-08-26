<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin\Analytics;

use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SalesAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_retrieve_sales_summary_metrics(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/analytics/sales?period=last_7_days');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_revenue',
                    'net_revenue',
                    'total_tax',
                    'total_shipping',
                    'total_discounts',
                    'total_orders',
                    'avg_order_value',
                    'total_items_sold',
                ],
            ]);
    }

    public function test_admin_can_retrieve_sales_chart_data(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/analytics/sales/chart?period=last_7_days&granularity=daily');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'granularity',
                    'labels',
                    'datasets',
                ],
            ]);
    }

    public function test_admin_can_retrieve_revenue_breakdown_by_category_and_brand(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/analytics/revenue?period=last_30_days');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary',
                    'by_category',
                    'by_brand',
                ],
            ]);
    }
}
