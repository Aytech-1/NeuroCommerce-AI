<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin;

use App\Modules\Admin\Models\AuditActivityLog;
use App\Modules\Admin\Models\AuditLog;
use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
        $this->admin->givePermissionTo('audit.view');
    }

    public function test_admin_can_list_and_filter_audit_logs(): void
    {
        AuditLog::create([
            'user_id' => $this->admin->id,
            'event' => 'product.price_updated',
            'auditable_type' => 'App\\Modules\\Catalog\\Models\\Product',
            'auditable_id' => '00000000-0000-0000-0000-000000000001',
            'old_values' => ['price' => 100],
            'new_values' => ['price' => 120],
            'ip_address' => '127.0.0.1',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/audit-logs?filter[event]=product.price_updated');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'event', 'auditable_type', 'auditable_id', 'old_values', 'new_values'],
                ],
                'meta' => ['total'],
            ]);
    }

    public function test_admin_can_list_activity_logs(): void
    {
        AuditActivityLog::create([
            'user_id' => $this->admin->id,
            'action' => 'exported_sales_report',
            'description' => 'Admin exported Q3 sales report',
            'ip_address' => '127.0.0.1',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/activity-logs');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
