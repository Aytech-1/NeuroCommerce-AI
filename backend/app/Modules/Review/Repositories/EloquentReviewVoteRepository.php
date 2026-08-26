<?php

declare(strict_types=1);

namespace App\Modules\Review\Repositories;

use App\Modules\Review\Contracts\ReviewVoteRepositoryInterface;
use App\Modules\Review\Enums\ReviewVoteType;
use App\Modules\Review\Models\ReviewVote;

/**
 * Class EloquentReviewVoteRepository
 *
 * @package App\Modules\Review\Repositories
 */
class EloquentReviewVoteRepository implements ReviewVoteRepositoryInterface
{
    /**
     * EloquentReviewVoteRepository constructor.
     */
    public function __construct(
        protected ReviewVote $model
    ) {}

    /**
     * {@inheritDoc}
     */
    public function castVote(string $reviewId, string $userId, ReviewVoteType $vote): ReviewVote
    {
        return $this->model->newQuery()->updateOrCreate(
            [
                'review_id' => $reviewId,
                'user_id' => $userId,
            ],
            [
                'vote' => $vote,
                'created_at' => now(),
            ]
        );
    }

    /**
     * {@inheritDoc}
     */
    public function removeVote(string $reviewId, string $userId): bool
    {
        return (bool) $this->model->newQuery()
            ->where('review_id', $reviewId)
            ->where('user_id', $userId)
            ->delete();
    }

    /**
     * {@inheritDoc}
     */
    public function findVote(string $reviewId, string $userId): ?ReviewVote
    {
        return $this->model->newQuery()
            ->where('review_id', $reviewId)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function countHelpfulVotes(string $reviewId): int
    {
        return $this->model->newQuery()
            ->where('review_id', $reviewId)
            ->where('vote', ReviewVoteType::HELPFUL)
            ->count();
    }
}
