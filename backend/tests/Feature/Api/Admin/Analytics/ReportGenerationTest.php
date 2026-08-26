<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin\Analytics;

use App\Modules\Auth\Models\User;
use App\Modules\Order\Models\Order;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportGenerationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
    }

    public function test_admin_can_export_orders_as_csv_stream(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/reports/orders/export', [
                'format' => 'csv',
                'date_from' => now()->subDays(30)->toDateString(),
                'date_to' => now()->toDateString(),
            ]);

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', (string) $response->headers->get('content-type'));
    }

    public function test_admin_can_export_orders_as_json(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/reports/orders/export', [
                'format' => 'json',
                'date_from' => now()->subDays(30)->toDateString(),
                'date_to' => now()->toDateString(),
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_admin_can_export_tax_summary(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/reports/tax/export', [
                'date_from' => now()->subDays(30)->toDateString(),
                'date_to' => now()->toDateString(),
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data',
            ]);
    }

    public function test_admin_can_export_inventory_valuation(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/admin/reports/inventory/export');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'summary',
                    'items',
                ],
            ]);
    }
}
