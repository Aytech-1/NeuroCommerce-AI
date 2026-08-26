<?php

declare(strict_types=1);

namespace Tests\Feature\Api\AI;

use App\Modules\AI\Contracts\AIProviderInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecommendationFallbackTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->customer = User::factory()->customer()->create();
        $this->product = Product::factory()->create(['status' => 'active', 'total_sold' => 100]);
    }

    public function test_recommendations_fallback_to_trending_when_provider_returns_empty(): void
    {
        $mockProvider = new class implements AIProviderInterface {
            public function predict(?string $userId, array $context = [], int $limit = 10): array
            {
                return []; // Simulate timeout or empty response
            }

            public function getSimilar(string $productId, int $limit = 10): array
            {
                return [];
            }

            public function checkHealth(): array
            {
                return ['status' => 'degraded'];
            }
        };

        $this->app->instance(AIProviderInterface::class, $mockProvider);

        Sanctum::actingAs($this->customer, ['*']);

        $response = $this->getJson('/api/v1/recommendations/personalized?limit=5');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
