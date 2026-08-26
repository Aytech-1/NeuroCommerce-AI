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

class BehaviorTrackingTest extends TestCase
{
    use RefreshDatabase;

    protected User $customer;
    protected Product $product;
    protected Category $category;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->customer = User::factory()->customer()->create();
        $this->category = Category::factory()->create();
        $this->product = Product::factory()->create(['category_id' => $this->category->id]);
    }

    public function test_user_can_track_single_behavior_event(): void
    {
        Sanctum::actingAs($this->customer, ['*']);

        $payload = [
            'event_type' => 'product_view',
            'product_id' => (string) $this->product->id,
            'category_id' => (string) $this->category->id,
            'page_url' => "/products/{$this->product->slug}",
            'duration_seconds' => 30,
            'scroll_depth' => 80,
            'device_type' => 'desktop',
            'metadata' => ['source' => 'search'],
        ];

        $response = $this->postJson('/api/v1/tracking/events', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['event_id']]);

        $this->assertDatabaseHas('ai_behavior_events', [
            'user_id' => $this->customer->id,
            'event_type' => 'product_view',
            'product_id' => $this->product->id,
        ]);
    }

    public function test_user_can_track_batch_behavior_events(): void
    {
        $payload = [
            'events' => [
                [
                    'event_type' => 'page_view',
                    'page_url' => '/home',
                    'duration_seconds' => 10,
                ],
                [
                    'event_type' => 'search',
                    'search_query' => 'wireless headphones',
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/tracking/events/batch', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.tracked_count', 2);
    }

    public function test_user_can_track_specialized_tracking_endpoints(): void
    {
        $this->postJson('/api/v1/tracking/page-view', ['page_url' => '/about'])
            ->assertStatus(201);

        $this->postJson('/api/v1/tracking/product-view', ['product_id' => (string) $this->product->id])
            ->assertStatus(201);

        $this->postJson('/api/v1/tracking/search', ['search_query' => 'leather jacket'])
            ->assertStatus(201);
    }
}
