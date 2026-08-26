<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin\Analytics;

use App\Modules\Admin\Enums\CustomerSegment;
use App\Modules\Admin\Models\AnalyticsCustomer;
use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_retrieve_customer_metrics_and_ltv(): void
    {
        $customer = User::factory()->create();

        AnalyticsCustomer::factory()->create([
            'user_id' => $customer->id,
            'total_orders' => 4,
            'total_spent' => 600.00,
            'avg_order_value' => 150.00,
            'customer_segment' => CustomerSegment::LOYAL,
            'lifetime_value' => 600.00,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/analytics/customers?period=last_30_days');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_customers',
                    'new_customers',
                    'active_customers',
                    'average_ltv',
                    'segments',
                ],
            ]);
    }

    public function test_admin_can_retrieve_customer_segments_breakdown(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/admin/analytics/customers/segments');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'new',
                    'active',
                    'loyal',
                    'at_risk',
                    'churned',
                ],
            ]);
    }
}
