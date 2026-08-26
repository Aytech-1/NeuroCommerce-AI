<?php

declare(strict_types=1);

namespace App\Modules\Review\Database\Factories;

use App\Modules\Auth\Models\User;
use App\Modules\Review\Enums\ReviewVoteType;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Models\ReviewVote;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReviewVote>
 */
class ReviewVoteFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<ReviewVote>
     */
    protected $model = ReviewVote::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'review_id' => Review::factory(),
            'user_id' => User::factory(),
            'vote' => ReviewVoteType::HELPFUL,
            'created_at' => now(),
        ];
    }
}
