<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Admin;

use App\Modules\Admin\Models\FeatureFlag;
use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FeatureFlagTest extends TestCase
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

    public function test_admin_can_list_feature_flags(): void
    {
        FeatureFlag::create([
            'name' => 'ai_recommendations_v2',
            'is_enabled' => true,
            'rollout_percentage' => 50,
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->getJson('/api/v1/admin/feature-flags');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_toggle_feature_flag(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->patchJson('/api/v1/admin/feature-flags/guest_checkout', [
            'is_enabled' => true,
            'rollout_percentage' => 100,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'guest_checkout')
            ->assertJsonPath('data.is_enabled', true);

        $this->assertDatabaseHas('sys_feature_flags', [
            'name' => 'guest_checkout',
            'is_enabled' => true,
        ]);
    }
}
