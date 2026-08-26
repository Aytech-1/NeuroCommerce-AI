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

class Phase23AuditTrailsComplianceTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;
    protected User $unprivilegedStaff;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->admin = User::factory()->admin()->create();
        $this->admin->givePermissionTo('audit.view');

        $this->unprivilegedStaff = User::factory()->admin()->create();

        $this->customer = User::factory()->customer()->create();
    }

    public function test_admin_can_list_audit_logs_with_pagination(): void
    {
        AuditLog::create([
            'user_id' => $this->admin->id,
            'event' => 'product.created',
            'auditable_type' => 'App\\Modules\\Catalog\\Models\\Product',
            'auditable_id' => '00000000-0000-0000-0000-000000000001',
            'old_values' => null,
            'new_values' => ['name' => 'Flagship Widget', 'base_price' => 99.99],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit/TestRunner',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/audit-logs');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'event', 'auditable_type', 'auditable_id', 'old_values', 'new_values', 'ip_address', 'created_at'],
                ],
                'meta' => ['current_page', 'per_page', 'total'],
            ]);
    }

    public function test_admin_can_retrieve_single_audit_log_detail(): void
    {
        $log = AuditLog::create([
            'user_id' => $this->admin->id,
            'event' => 'order.status_updated',
            'auditable_type' => 'App\\Modules\\Order\\Models\\Order',
            'auditable_id' => '00000000-0000-0000-0000-000000000002',
            'old_values' => ['status' => 'pending'],
            'new_values' => ['status' => 'processing'],
            'ip_address' => '127.0.0.1',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson("/api/v1/admin/audit-logs/{$log->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', (string) $log->id)
            ->assertJsonPath('data.event', 'order.status_updated')
            ->assertJsonPath('data.old_values.status', 'pending')
            ->assertJsonPath('data.new_values.status', 'processing');
    }

    public function test_retrieving_nonexistent_audit_log_returns_404(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/audit-logs/00000000-0000-0000-0000-999999999999');

        $response->assertStatus(404);
    }

    public function test_admin_can_filter_audit_logs_by_criteria(): void
    {
        AuditLog::create([
            'user_id' => $this->admin->id,
            'event' => 'inventory.adjusted',
            'auditable_type' => 'App\\Modules\\Inventory\\Models\\InventoryItem',
            'auditable_id' => '00000000-0000-0000-0000-000000000003',
            'old_values' => ['quantity' => 10],
            'new_values' => ['quantity' => 20],
        ]);

        AuditLog::create([
            'user_id' => $this->admin->id,
            'event' => 'setting.updated',
            'auditable_type' => 'App\\Modules\\Admin\\Models\\SystemSetting',
            'auditable_id' => '00000000-0000-0000-0000-000000000004',
            'old_values' => ['value' => 'old'],
            'new_values' => ['value' => 'new'],
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $filterResponse = $this->getJson('/api/v1/admin/audit-logs?filter[event]=inventory.adjusted');

        $filterResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $events = collect($filterResponse->json('data'))->pluck('event');
        $this->assertTrue($events->contains('inventory.adjusted'));
        $this->assertFalse($events->contains('setting.updated'));
    }

    public function test_admin_can_list_activity_logs(): void
    {
        AuditActivityLog::create([
            'user_id' => $this->admin->id,
            'action' => 'exported_financial_report',
            'description' => 'Admin exported year-end tax report',
            'properties' => ['format' => 'csv', 'year' => 2026],
            'ip_address' => '127.0.0.1',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/activity-logs');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'action', 'description', 'properties', 'created_at'],
                ],
            ]);
    }

    public function test_admin_can_retrieve_user_specific_activity_logs(): void
    {
        AuditActivityLog::create([
            'user_id' => $this->customer->id,
            'action' => 'user_login',
            'description' => 'Customer Jane Doe logged in from mobile device',
            'ip_address' => '192.168.1.1',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson("/api/v1/admin/activity-logs/user/{$this->customer->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.action', 'user_login');
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $this->getJson('/api/v1/admin/audit-logs')->assertStatus(401);
        $this->getJson('/api/v1/admin/activity-logs')->assertStatus(401);
    }

    public function test_customer_receives_403_on_audit_endpoints(): void
    {
        Sanctum::actingAs($this->customer, ['*']);

        $this->getJson('/api/v1/admin/audit-logs')->assertStatus(403);
        $this->getJson('/api/v1/admin/activity-logs')->assertStatus(403);
        $this->getJson("/api/v1/admin/activity-logs/user/{$this->customer->id}")->assertStatus(403);
    }

    public function test_unprivileged_staff_without_audit_permission_receives_403(): void
    {
        Sanctum::actingAs($this->unprivilegedStaff, ['*']);

        $this->getJson('/api/v1/admin/audit-logs')->assertStatus(403);
        $this->getJson('/api/v1/admin/activity-logs')->assertStatus(403);
    }

    public function test_audit_logs_are_append_only_and_cannot_be_mutated_via_api(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $log = AuditLog::create([
            'user_id' => $this->admin->id,
            'event' => 'security.immutable_check',
            'auditable_type' => 'Test',
            'auditable_id' => '00000000-0000-0000-0000-000000000005',
        ]);

        // Attempt PUT / PATCH
        $this->putJson("/api/v1/admin/audit-logs/{$log->id}", ['event' => 'tampered'])->assertStatus(405);
        $this->patchJson("/api/v1/admin/audit-logs/{$log->id}", ['event' => 'tampered'])->assertStatus(405);

        // Attempt DELETE
        $this->deleteJson("/api/v1/admin/audit-logs/{$log->id}")->assertStatus(405);
    }
}
