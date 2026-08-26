<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Review;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Review\Models\Review;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewVotingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_customer_can_vote_helpful_on_review(): void
    {
        $author = User::factory()->customer()->create();
        $voter = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->approved()->create([
            'user_id' => $author->id,
            'product_id' => $product->id,
            'helpful_count' => 0,
        ]);

        $response = $this->actingAs($voter, 'sanctum')->postJson("/api/v1/reviews/{$review->id}/vote", [
            'vote' => 'helpful',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.vote', 'helpful');

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'helpful_count' => 1,
        ]);

        $this->assertDatabaseHas('review_votes', [
            'review_id' => $review->id,
            'user_id' => $voter->id,
            'vote' => 'helpful',
        ]);
    }

    public function test_customer_changing_vote_updates_helpful_count_properly(): void
    {
        $author = User::factory()->customer()->create();
        $voter = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->approved()->create([
            'user_id' => $author->id,
            'product_id' => $product->id,
            'helpful_count' => 0,
        ]);

        // 1. Vote helpful
        $this->actingAs($voter, 'sanctum')->postJson("/api/v1/reviews/{$review->id}/vote", [
            'vote' => 'helpful',
        ]);

        // 2. Change vote to not_helpful
        $this->actingAs($voter, 'sanctum')->postJson("/api/v1/reviews/{$review->id}/vote", [
            'vote' => 'not_helpful',
        ]);

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'helpful_count' => 0,
        ]);
    }

    public function test_customer_cannot_vote_on_their_own_review(): void
    {
        $author = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->approved()->create([
            'user_id' => $author->id,
            'product_id' => $product->id,
        ]);

        $response = $this->actingAs($author, 'sanctum')->postJson("/api/v1/reviews/{$review->id}/vote", [
            'vote' => 'helpful',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('code', 'SELF_VOTE_PROHIBITED');
    }

    public function test_unauthenticated_user_cannot_vote(): void
    {
        $author = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->approved()->create([
            'user_id' => $author->id,
            'product_id' => $product->id,
        ]);

        $response = $this->postJson("/api/v1/reviews/{$review->id}/vote", [
            'vote' => 'helpful',
        ]);

        $response->assertStatus(401);
    }
}
