<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Review;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Review\Jobs\RecalculateProductRatingJob;
use App\Modules\Review\Models\Review;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewRatingAggregationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_aggregate_rating_calculates_accurately_for_approved_reviews(): void
    {
        $product = Product::factory()->create();
        $u1 = User::factory()->customer()->create();
        $u2 = User::factory()->customer()->create();
        $u3 = User::factory()->customer()->create();

        // 1. Approved 5 stars
        Review::factory()->approved()->create([
            'user_id' => $u1->id,
            'product_id' => $product->id,
            'rating' => 5,
        ]);

        // 2. Approved 3 stars
        Review::factory()->approved()->create([
            'user_id' => $u2->id,
            'product_id' => $product->id,
            'rating' => 3,
        ]);

        // 3. Pending 1 star (must be ignored)
        Review::factory()->create([
            'user_id' => $u3->id,
            'product_id' => $product->id,
            'rating' => 1,
            'is_approved' => false,
        ]);

        dispatch_sync(new RecalculateProductRatingJob($product->id));

        $product->refresh();

        // Average of 5 and 3 is 4.00, count is 2
        $this->assertEquals(4.0, (float) $product->avg_rating);
        $this->assertEquals(2, $product->review_count);
    }

    public function test_approving_review_updates_product_rating_aggregates(): void
    {
        $admin = User::where('email', 'admin@neurocommerce.test')->first() ?? User::factory()->admin()->create();
        $admin->assignRole('admin');
        $admin->givePermissionTo('review.moderate');

        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create([
            'avg_rating' => '0.00',
            'review_count' => 0,
        ]);

        $review = Review::factory()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
            'rating' => 5,
            'is_approved' => false,
        ]);

        $response = $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/admin/reviews/{$review->id}/approve");
        $response->assertStatus(200);

        $product->refresh();
        $this->assertEquals(5.0, (float) $product->avg_rating);
        $this->assertEquals(1, $product->review_count);
    }

    public function test_deleting_approved_review_recalculates_rating(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->approved()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
            'rating' => 5,
        ]);

        dispatch_sync(new RecalculateProductRatingJob($product->id));
        $product->refresh();
        $this->assertEquals(1, $product->review_count);

        $this->actingAs($customer, 'sanctum')->deleteJson("/api/v1/customer/reviews/{$review->id}");

        $product->refresh();
        $this->assertEquals(0, $product->review_count);
        $this->assertEquals(0.0, (float) $product->avg_rating);
    }
}
