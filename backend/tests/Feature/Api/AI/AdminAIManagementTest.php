<?php

declare(strict_types=1);

namespace Tests\Feature\Api\AI;

use App\Modules\AI\Models\AIModelVersion;
use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAIManagementTest extends TestCase
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

    public function test_admin_can_list_models_and_view_metrics(): void
    {
        AIModelVersion::create([
            'version' => 'v1.0',
            'model_type' => 'ncf',
            'is_active' => true,
        ]);

        Sanctum::actingAs($this->admin, ['*']);

        $models = $this->getJson('/api/v1/admin/ai/models');
        $models->assertStatus(200)->assertJsonPath('success', true);

        $metrics = $this->getJson('/api/v1/admin/ai/metrics');
        $metrics->assertStatus(200)->assertJsonPath('success', true);
    }

    public function test_admin_can_trigger_model_retraining(): void
    {
        Sanctum::actingAs($this->admin, ['*']);

        $response = $this->postJson('/api/v1/admin/ai/retrain', [
            'model_type' => 'ncf',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.model_type', 'ncf');
    }
}
