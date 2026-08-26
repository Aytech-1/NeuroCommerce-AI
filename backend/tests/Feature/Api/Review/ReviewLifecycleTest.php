<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Review;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Review\Models\Review;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewLifecycleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_customer_can_list_their_own_reviews(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        Review::factory()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
            'title' => 'My First Review',
        ]);

        $response = $this->actingAs($customer, 'sanctum')->getJson('/api/v1/customer/reviews');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.title', 'My First Review');
    }

    public function test_customer_can_update_their_own_review(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
            'rating' => 3,
            'title' => 'Initial Title',
        ]);

        $response = $this->actingAs($customer, 'sanctum')->putJson("/api/v1/customer/reviews/{$review->id}", [
            'rating' => 5,
            'title' => 'Updated Title to 5 stars',
            'body' => 'After further use, it is actually 5 stars.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.title', 'Updated Title to 5 stars');

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'rating' => 5,
            'title' => 'Updated Title to 5 stars',
        ]);
    }

    public function test_customer_can_delete_their_own_review(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($customer, 'sanctum')->deleteJson("/api/v1/customer/reviews/{$review->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertSoftDeleted('reviews', [
            'id' => $review->id,
        ]);
    }

    public function test_public_endpoint_exposes_only_approved_non_deleted_reviews(): void
    {
        $customer1 = User::factory()->customer()->create();
        $customer2 = User::factory()->customer()->create();
        $customer3 = User::factory()->customer()->create();
        $product = Product::factory()->create();

        // 1. Approved review -> visible
        Review::factory()->approved()->create([
            'user_id' => $customer1->id,
            'product_id' => $product->id,
            'title' => 'Approved Review',
        ]);

        // 2. Pending review -> invisible
        Review::factory()->create([
            'user_id' => $customer2->id,
            'product_id' => $product->id,
            'is_approved' => false,
            'title' => 'Pending Review',
        ]);

        // 3. Soft deleted review -> invisible
        $deletedReview = Review::factory()->approved()->create([
            'user_id' => $customer3->id,
            'product_id' => $product->id,
            'title' => 'Deleted Review',
        ]);
        $deletedReview->delete();

        $response = $this->getJson("/api/v1/products/{$product->id}/reviews");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Approved Review');
    }
}
