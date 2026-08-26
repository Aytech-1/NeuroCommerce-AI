<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin;

use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->admin = User::factory()->admin()->create();
        $this->admin->givePermissionTo('setting.view', 'setting.update');
    }

    public function test_admin_can_retrieve_all_grouped_settings(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/settings');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_bulk_update_settings_and_read_them_back(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $payload = [
            'settings' => [
                [
                    'group' => 'store',
                    'key' => 'store_name',
                    'value' => 'NeuroCommerce AI MegaStore',
                    'type' => 'string',
                    'is_public' => true,
                    'description' => 'Main store title',
                ],
                [
                    'group' => 'payment',
                    'key' => 'stripe_live_secret',
                    'value' => 'sk_live_very_secret_token_123',
                    'type' => 'encrypted',
                    'is_public' => false,
                    'description' => 'Stripe secret API key',
                ],
            ],
        ];

        $updateResponse = $this->putJson('/api/v1/admin/settings', $payload);
        $updateResponse->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('sys_settings', [
            'group' => 'store',
            'key' => 'store_name',
        ]);

        $groupResponse = $this->getJson('/api/v1/admin/settings/payment');
        $groupResponse->assertStatus(200)
            ->assertJsonPath('data.stripe_live_secret.value', '********');
    }
}
