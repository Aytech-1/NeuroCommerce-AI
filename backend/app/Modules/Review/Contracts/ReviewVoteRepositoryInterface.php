<?php

declare(strict_types=1);

namespace App\Modules\Review\Contracts;

use App\Modules\Review\Enums\ReviewVoteType;
use App\Modules\Review\Models\ReviewVote;

/**
 * Interface ReviewVoteRepositoryInterface
 *
 * @package App\Modules\Review\Contracts
 */
interface ReviewVoteRepositoryInterface
{
    /**
     * Cast or update a vote on a review.
     *
     * @param string $reviewId
     * @param string $userId
     * @param ReviewVoteType $vote
     * @return ReviewVote
     */
    public function castVote(string $reviewId, string $userId, ReviewVoteType $vote): ReviewVote;

    /**
     * Remove a user's vote on a review.
     *
     * @param string $reviewId
     * @param string $userId
     * @return bool
     */
    public function removeVote(string $reviewId, string $userId): bool;

    /**
     * Find existing vote.
     *
     * @param string $reviewId
     * @param string $userId
     * @return ReviewVote|null
     */
    public function findVote(string $reviewId, string $userId): ?ReviewVote;

    /**
     * Count helpful votes for a review.
     *
     * @param string $reviewId
     * @return int
     */
    public function countHelpfulVotes(string $reviewId): int;
}
