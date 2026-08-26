<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Review\Models\Review;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
        $this->admin->givePermissionTo('dashboard.view');
    }

    public function test_admin_can_view_dashboard_summary_kpi_metrics(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/dashboard/summary');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'revenue' => ['total', 'this_month'],
                    'orders' => ['total', 'this_month'],
                    'customers' => ['total', 'new_this_month'],
                    'products' => ['total', 'active'],
                ],
            ]);
    }

    public function test_admin_can_retrieve_sales_chart_data(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/dashboard/sales-chart?period=daily');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_retrieve_recent_orders_and_top_products(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $recentOrders = $this->getJson('/api/v1/admin/dashboard/recent-orders');
        $recentOrders->assertStatus(200)->assertJsonPath('success', true);

        $topProducts = $this->getJson('/api/v1/admin/dashboard/top-products');
        $topProducts->assertStatus(200)->assertJsonPath('success', true);
    }

    public function test_admin_can_retrieve_low_stock_items_and_recent_reviews(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $lowStock = $this->getJson('/api/v1/admin/dashboard/low-stock');
        $lowStock->assertStatus(200)->assertJsonPath('success', true);

        $recentReviews = $this->getJson('/api/v1/admin/dashboard/recent-reviews');
        $recentReviews->assertStatus(200)->assertJsonPath('success', true);
    }
}
