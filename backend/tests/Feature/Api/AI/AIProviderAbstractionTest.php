<?php

declare(strict_types=1);

namespace Tests\Feature\Api\AI;

use App\Modules\AI\Contracts\AIProviderInterface;
use App\Modules\AI\Services\MockAIProvider;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AIProviderAbstractionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_mock_provider_returns_deterministic_ranked_predictions(): void
    {
        $category = Category::factory()->create();
        Product::factory()->count(5)->create([
            'category_id' => $category->id,
            'status' => 'active',
        ]);

        $provider = new MockAIProvider();
        $predictions = $provider->predict('00000000-0000-0000-0000-000000000001', [], 3);

        $this->assertCount(3, $predictions);
        $this->assertArrayHasKey('product_id', $predictions[0]);
        $this->assertArrayHasKey('score', $predictions[0]);
        $this->assertGreaterThan($predictions[1]['score'], $predictions[0]['score']);

        $health = $provider->checkHealth();
        $this->assertEquals('healthy', $health['status']);
    }
}
