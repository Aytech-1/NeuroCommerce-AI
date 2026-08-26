<?php

declare(strict_types=1);

namespace Tests\Feature\Api\AI;

use App\Modules\Auth\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AISecurityAndRbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_customer_cannot_access_admin_ai_endpoints(): void
    {
        $customer = User::factory()->customer()->create();
        Sanctum::actingAs($customer, ['*']);

        $this->getJson('/api/v1/admin/ai/models')->assertStatus(403);
        $this->getJson('/api/v1/admin/ai/metrics')->assertStatus(403);
        $this->postJson('/api/v1/admin/ai/retrain', ['model_type' => 'ncf'])->assertStatus(403);
    }

    public function test_unauthenticated_request_to_protected_routes_returns_401(): void
    {
        $this->getJson('/api/v1/recommendations/personalized')->assertStatus(401);
        $this->postJson('/api/v1/recommendations/feedback', [])->assertStatus(401);
        $this->getJson('/api/v1/recommendations/history')->assertStatus(401);
        $this->getJson('/api/v1/admin/ai/models')->assertStatus(401);
    }
}
