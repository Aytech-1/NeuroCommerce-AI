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
    protected User $unprivilegedUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
        $this->admin->givePermissionTo('audit.view');
        $this->unprivilegedUser = User::factory()->customer()->create();
    }

    public function test_admin_can_list_and_filter_audit_logs(): void
    {
        AuditLog::create([
            'user_id' => $this->admin->id,
            'user_type' => 'App\\Modules\\Auth\\Models\\User',
            'event' => 'product.price_updated',
            'auditable_type' => 'App\\Modules\\Catalog\\Models\\Product',
            'auditable_id' => '00000000-0000-0000-0000-000000000001',
            'old_values' => ['price' => 100],
            'new_values' => ['price' => 120],
            'url' => 'https://api.neurocommerce.ai/v1/admin/products/1',
            'ip_address' => '127.0.0.1',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/audit-logs?filter[event]=product.price_updated');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'user_id', 'user_type', 'event', 'auditable_type', 'auditable_id', 'old_values', 'new_values', 'url', 'ip_address'],
                ],
                'meta' => ['total'],
            ]);
    }

    public function test_admin_can_search_audit_logs(): void
    {
        AuditLog::create([
            'user_id' => $this->admin->id,
            'event' => 'order.fraud_flagged',
            'auditable_type' => 'App\\Modules\\Order\\Models\\Order',
            'auditable_id' => '00000000-0000-0000-0000-000000000099',
            'old_values' => ['risk_score' => 10],
            'new_values' => ['risk_score' => 95],
            'ip_address' => '10.0.0.42',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/audit-logs?search=fraud_flagged');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $events = collect($response->json('data'))->pluck('event');
        $this->assertTrue($events->contains('order.fraud_flagged'));
    }

    public function test_audit_logs_redact_sensitive_credentials(): void
    {
        $log = AuditLog::create([
            'user_id' => $this->admin->id,
            'event' => 'user.credentials_updated',
            'auditable_type' => 'App\\Modules\\Auth\\Models\\User',
            'auditable_id' => (string) $this->admin->id,
            'old_values' => [
                'password' => '$2y$12$oldhashvaluehere',
                'stripe_secret_key' => 'sk_live_oldsecret123',
                'api_token' => 'tok_oldsecret',
                'normal_field' => 'visible_old',
            ],
            'new_values' => [
                'password' => '$2y$12$newhashvaluehere',
                'stripe_secret_key' => 'sk_live_newsecret456',
                'api_token' => 'tok_newsecret',
                'normal_field' => 'visible_new',
            ],
            'ip_address' => '127.0.0.1',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson("/api/v1/admin/audit-logs/{$log->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.old_values.password', '[REDACTED]')
            ->assertJsonPath('data.old_values.stripe_secret_key', '[REDACTED]')
            ->assertJsonPath('data.old_values.api_token', '[REDACTED]')
            ->assertJsonPath('data.old_values.normal_field', 'visible_old')
            ->assertJsonPath('data.new_values.password', '[REDACTED]')
            ->assertJsonPath('data.new_values.stripe_secret_key', '[REDACTED]')
            ->assertJsonPath('data.new_values.api_token', '[REDACTED]')
            ->assertJsonPath('data.new_values.normal_field', 'visible_new');
    }

    public function test_audit_logs_are_strictly_immutable(): void
    {
        $log = AuditLog::create([
            'user_id' => $this->admin->id,
            'event' => 'security.tamper_test',
            'auditable_type' => 'App\\Modules\\Admin\\Models\\AuditLog',
            'auditable_id' => '00000000-0000-0000-0000-000000000002',
            'ip_address' => '127.0.0.1',
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $this->putJson("/api/v1/admin/audit-logs/{$log->id}", ['event' => 'altered'])->assertStatus(405);
        $this->patchJson("/api/v1/admin/audit-logs/{$log->id}", ['event' => 'altered'])->assertStatus(405);
        $this->deleteJson("/api/v1/admin/audit-logs/{$log->id}")->assertStatus(405);
    }

    public function test_unauthenticated_and_unauthorized_access_is_blocked(): void
    {
        $this->getJson('/api/v1/admin/audit-logs')->assertStatus(401);

        Sanctum::actingAs($this->unprivilegedUser, ['*']);
        $this->getJson('/api/v1/admin/audit-logs')->assertStatus(403);
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

