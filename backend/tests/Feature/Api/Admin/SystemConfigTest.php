<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin;

use App\Modules\Admin\Models\SystemConfig;
use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SystemConfigTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
        $this->admin->givePermissionTo('config.view', 'config.update');
    }

    public function test_admin_can_retrieve_system_configs(): void
    {
        SystemConfig::create([
            'namespace' => 'checkout',
            'key' => 'allowed_payment_methods',
            'config_value' => ['stripe', 'paypal', 'apple_pay'],
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/system-config');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_update_system_config_namespace(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $payload = [
            'configs' => [
                [
                    'key' => 'rate_limits',
                    'config_value' => ['api_limit' => 120, 'auth_limit' => 5],
                ],
            ],
        ];

        $response = $this->putJson('/api/v1/admin/system-config/security', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('sys_system_configs', [
            'namespace' => 'security',
            'key' => 'rate_limits',
        ]);
    }
}
