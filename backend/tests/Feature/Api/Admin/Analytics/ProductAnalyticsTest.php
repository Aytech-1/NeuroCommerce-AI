<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin\Analytics;

use App\Modules\Admin\Models\AnalyticsProductPerformance;
use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_retrieve_top_products_performance(): void
    {
        $product = Product::first() ?? Product::factory()->create();

        AnalyticsProductPerformance::factory()->create([
            'product_id' => $product->id,
            'date' => now()->toDateString(),
            'views' => 200,
            'purchase_count' => 15,
            'revenue' => 1499.50,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/analytics/products?period=last_30_days&sort_by=revenue&limit=5');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_admin_can_retrieve_single_product_analytics_detail(): void
    {
        $product = Product::first() ?? Product::factory()->create();

        AnalyticsProductPerformance::factory()->create([
            'product_id' => $product->id,
            'date' => now()->toDateString(),
            'views' => 100,
            'purchase_count' => 10,
            'revenue' => 999.00,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/admin/analytics/products/{$product->id}?period=last_30_days");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.product_id', (string) $product->id)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'product_id',
                    'total_views',
                    'total_purchases',
                    'total_revenue',
                    'conversion_rate_percentage',
                    'history',
                ],
            ]);
    }
}
