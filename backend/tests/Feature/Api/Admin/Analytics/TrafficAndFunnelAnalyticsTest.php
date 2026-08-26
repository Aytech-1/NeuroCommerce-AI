<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin\Analytics;

use App\Modules\Admin\Models\AnalyticsTraffic;
use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrafficAndFunnelAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_retrieve_traffic_behavior_telemetry(): void
    {
        AnalyticsTraffic::factory()->create([
            'date' => now()->toDateString(),
            'page_views' => 1500,
            'unique_visitors' => 800,
            'sessions' => 1000,
            'avg_session_duration' => 180,
            'bounce_rate' => 0.3200,
            'source' => 'organic',
            'device_type' => 'mobile',
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/analytics/behavior?period=last_7_days');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'page_views',
                    'unique_visitors',
                    'sessions',
                    'avg_session_duration_seconds',
                    'bounce_rate',
                    'by_source',
                    'by_device',
                ],
            ]);
    }

    public function test_admin_can_retrieve_funnel_conversion_metrics(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/analytics/behavior/funnel?period=last_30_days');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'stages' => [
                        'views',
                        'cart_adds',
                        'checkouts',
                        'purchases',
                    ],
                    'rates' => [
                        'view_to_cart_percentage',
                        'cart_to_checkout_percentage',
                        'overall_conversion_percentage',
                    ],
                ],
            ]);
    }
}
