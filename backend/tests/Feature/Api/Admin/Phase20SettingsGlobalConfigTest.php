<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin;

use App\Modules\Admin\Models\FeatureFlag;
use App\Modules\Admin\Models\SystemConfig;
use App\Modules\Admin\Models\SystemSetting;
use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase20SettingsGlobalConfigTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $customer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->admin = User::factory()->admin()->create();
        $this->admin->givePermissionTo('setting.view', 'setting.update', 'config.view', 'config.update');

        $this->customer = User::factory()->customer()->create();
    }

    public function test_public_settings_endpoint_returns_success_dictionary(): void
    {
        SystemSetting::create([
            'group' => 'general',
            'key' => 'store_name',
            'value' => 'NeuroCommerce Test Store',
            'type' => 'string',
            'is_public' => true,
        ]);

        $response = $this->getJson('/api/v1/settings');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.general.store_name', 'NeuroCommerce Test Store');
    }

    public function test_public_settings_endpoint_excludes_private_and_encrypted_settings(): void
    {
        SystemSetting::create([
            'group' => 'payment',
            'key' => 'stripe_secret_key',
            'value' => Crypt::encryptString('sk_test_secret12345'),
            'type' => 'encrypted',
            'is_public' => false,
        ]);

        SystemSetting::create([
            'group' => 'internal',
            'key' => 'secret_internal_token',
            'value' => 'sensitive_token_value',
            'type' => 'string',
            'is_public' => false,
        ]);

        $response = $this->getJson('/api/v1/settings');

        $response->assertStatus(200);
        $this->assertArrayNotHasKey('stripe_secret_key', $response->json('data.payment') ?? []);
        $this->assertArrayNotHasKey('internal', $response->json('data') ?? []);
    }

    public function test_public_settings_are_cached_in_redis(): void
    {
        Cache::flush();

        SystemSetting::create([
            'group' => 'general',
            'key' => 'support_email',
            'value' => 'support@neurocommerce.ai',
            'type' => 'string',
            'is_public' => true,
        ]);

        $response = $this->getJson('/api/v1/settings');
        $response->assertStatus(200);

        $this->assertTrue(Cache::has('nc_sys_settings_public'));
    }

    public function test_admin_can_retrieve_grouped_settings(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/settings');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_unauthorized_customer_cannot_view_admin_settings(): void
    {
        Sanctum::actingAs($this->customer, ['*']);

        $response = $this->getJson('/api/v1/admin/settings');

        $response->assertStatus(403);
    }

    public function test_admin_can_get_settings_by_group(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        SystemSetting::create([
            'group' => 'tax',
            'key' => 'default_rate',
            'value' => '0.08',
            'type' => 'string',
            'is_public' => false,
        ]);

        $response = $this->getJson('/api/v1/admin/settings/tax');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.default_rate.value', '0.08');
    }

    public function test_admin_can_bulk_update_settings_and_invalidates_cache(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $payload = [
            'settings' => [
                [
                    'group' => 'general',
                    'key' => 'store_name',
                    'value' => 'NeuroCommerce AI Flagship',
                    'type' => 'string',
                    'is_public' => true,
                ],
                [
                    'group' => 'currency',
                    'key' => 'default_currency',
                    'value' => 'USD',
                    'type' => 'string',
                    'is_public' => true,
                ],
            ],
        ];

        $response = $this->putJson('/api/v1/admin/settings', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.general.store_name.value', 'NeuroCommerce AI Flagship');

        $this->assertDatabaseHas('sys_settings', [
            'group' => 'general',
            'key' => 'store_name',
            'value' => 'NeuroCommerce AI Flagship',
        ]);
    }

    public function test_encrypted_settings_are_masked_in_admin_list(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $payload = [
            'settings' => [
                [
                    'group' => 'payment',
                    'key' => 'stripe_webhook_secret',
                    'value' => 'whsec_test_secret_abc123',
                    'type' => 'encrypted',
                    'is_public' => false,
                ],
            ],
        ];

        $response = $this->putJson('/api/v1/admin/settings', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('data.payment.stripe_webhook_secret.value', '********');

        // Assert that raw DB value is encrypted and not equal to plaintext
        $dbRecord = SystemSetting::where('group', 'payment')->where('key', 'stripe_webhook_secret')->first();
        $this->assertNotNull($dbRecord);
        $this->assertNotEquals('whsec_test_secret_abc123', $dbRecord->value);
        $this->assertEquals('whsec_test_secret_abc123', $dbRecord->parsed_value);
    }

    public function test_admin_can_list_and_toggle_feature_flags(): void
    {
        FeatureFlag::updateOrCreate(
            ['name' => 'ai_live_search'],
            ['is_enabled' => false, 'rollout_percentage' => 0]
        );

        Sanctum::actingAs($this->admin, ['*']);

        $listResponse = $this->getJson('/api/v1/admin/feature-flags');

        $listResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $toggleResponse = $this->patchJson('/api/v1/admin/feature-flags/ai_live_search', [
            'is_enabled' => true,
            'rollout_percentage' => 50,
        ]);

        $toggleResponse->assertStatus(200)
            ->assertJsonPath('data.is_enabled', true)
            ->assertJsonPath('data.rollout_percentage', 50);

        $this->assertDatabaseHas('sys_feature_flags', [
            'name' => 'ai_live_search',
            'is_enabled' => true,
            'rollout_percentage' => 50,
        ]);
    }

    public function test_admin_can_manage_system_configurations(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $listResponse = $this->getJson('/api/v1/admin/system-config');

        $listResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $updateResponse = $this->putJson('/api/v1/admin/system-config/checkout', [
            'configs' => [
                [
                    'key' => 'allowed_payment_methods',
                    'config_value' => ['stripe', 'paypal'],
                ],
            ],
        ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('sys_system_configs', [
            'namespace' => 'checkout',
            'key' => 'allowed_payment_methods',
        ]);
    }
}
