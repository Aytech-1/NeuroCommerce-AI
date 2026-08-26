<?php

declare(strict_types=1);

namespace Tests\Feature\Api\AI;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecommendationTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected Product $product1;
    protected Product $product2;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->customer = User::factory()->customer()->create();
        $category = Category::factory()->create();
        $this->product1 = Product::factory()->create(['category_id' => $category->id, 'status' => 'active']);
        $this->product2 = Product::factory()->create(['category_id' => $category->id, 'status' => 'active']);
    }

    public function test_customer_can_retrieve_personalized_recommendations(): void
    {
        Sanctum::actingAs($this->customer, ['*']);

        $response = $this->getJson('/api/v1/recommendations/personalized?limit=5');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => [['id', 'name', 'slug', 'base_price']]]);
    }

    public function test_public_user_can_retrieve_trending_and_similar_recommendations(): void
    {
        $trending = $this->getJson('/api/v1/recommendations/trending?limit=5');
        $trending->assertStatus(200)->assertJsonPath('success', true);

        $similar = $this->getJson("/api/v1/recommendations/similar/{$this->product1->id}?limit=5");
        $similar->assertStatus(200)->assertJsonPath('success', true);
    }

    public function test_user_can_retrieve_cross_sell_and_recently_viewed(): void
    {
        $crossSell = $this->getJson("/api/v1/recommendations/cross-sell?cart_products[]={$this->product1->id}");
        $crossSell->assertStatus(200)->assertJsonPath('success', true);

        $recentlyViewed = $this->getJson('/api/v1/recommendations/recently-viewed');
        $recentlyViewed->assertStatus(200)->assertJsonPath('success', true);
    }

    public function test_customer_can_submit_recommendation_feedback_and_view_history(): void
    {
        Sanctum::actingAs($this->customer, ['*']);

        $feedbackResponse = $this->postJson('/api/v1/recommendations/feedback', [
            'product_id' => (string) $this->product1->id,
            'strategy' => 'personalized',
            'feedback_type' => 'like',
            'rating' => 5,
        ]);

        $feedbackResponse->assertStatus(201)
            ->assertJsonPath('success', true);

        $historyResponse = $this->getJson('/api/v1/recommendations/history');
        $historyResponse->assertStatus(200)
            ->assertJsonPath('success', true);
    }
}
