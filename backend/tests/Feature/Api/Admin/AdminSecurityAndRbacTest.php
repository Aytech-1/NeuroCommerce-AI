<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin;

use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminSecurityAndRbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_customer_cannot_access_any_admin_governance_endpoints(): void
    {
        $customer = User::factory()->customer()->create();
        Sanctum::actingAs($customer, ['*']);

        $this->getJson('/api/v1/admin/dashboard/summary')->assertStatus(403);
        $this->getJson('/api/v1/admin/settings')->assertStatus(403);
        $this->putJson('/api/v1/admin/settings', ['settings' => []])->assertStatus(403);
        $this->getJson('/api/v1/admin/system-config')->assertStatus(403);
        $this->getJson('/api/v1/admin/feature-flags')->assertStatus(403);
        $this->getJson('/api/v1/admin/audit-logs')->assertStatus(403);
        $this->getJson('/api/v1/admin/notifications')->assertStatus(403);
    }

    public function test_unauthenticated_requests_receive_401(): void
    {
        $this->getJson('/api/v1/admin/dashboard/summary')->assertStatus(401);
        $this->getJson('/api/v1/admin/settings')->assertStatus(401);
        $this->getJson('/api/v1/admin/system-config')->assertStatus(401);
        $this->getJson('/api/v1/admin/feature-flags')->assertStatus(401);
        $this->getJson('/api/v1/admin/audit-logs')->assertStatus(401);
        $this->getJson('/api/v1/admin/notifications')->assertStatus(401);
    }
}
