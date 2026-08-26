<?php

declare(strict_types=1);

namespace Tests\Feature\Api\Review;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Review\Enums\ReviewVoteType;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Models\ReviewVote;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewConcurrencyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_database_unique_constraint_blocks_concurrent_duplicate_review_inserts(): void
    {
        $customer = User::factory()->customer()->create();
        $product = Product::factory()->create();

        Review::factory()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);

        $this->expectException(QueryException::class);

        // Attempting direct raw DB insert with identical user_id and product_id
        Review::factory()->create([
            'user_id' => $customer->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_database_composite_pk_blocks_duplicate_review_vote_inserts(): void
    {
        $author = User::factory()->customer()->create();
        $voter = User::factory()->customer()->create();
        $product = Product::factory()->create();

        $review = Review::factory()->create([
            'user_id' => $author->id,
            'product_id' => $product->id,
        ]);

        ReviewVote::create([
            'review_id' => $review->id,
            'user_id' => $voter->id,
            'vote' => ReviewVoteType::HELPFUL,
        ]);

        $this->expectException(QueryException::class);

        // Attempt duplicate raw insert on composite primary key
        ReviewVote::create([
            'review_id' => $review->id,
            'user_id' => $voter->id,
            'vote' => ReviewVoteType::HELPFUL,
        ]);
    }
}
