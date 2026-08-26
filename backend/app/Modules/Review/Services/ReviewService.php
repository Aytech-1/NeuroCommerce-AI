<?php

declare(strict_types=1);

namespace App\Modules\Review\Services;

use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Catalog\Models\Product;
use App\Modules\Review\Contracts\ReviewRepositoryInterface;
use App\Modules\Review\Contracts\ReviewVoteRepositoryInterface;
use App\Modules\Review\DTOs\CreateReviewDTO;
use App\Modules\Review\DTOs\UpdateReviewDTO;
use App\Modules\Review\Enums\ReviewVoteType;
use App\Modules\Review\Events\ReviewApproved;
use App\Modules\Review\Events\ReviewCreated;
use App\Modules\Review\Events\ReviewDeleted;
use App\Modules\Review\Events\ReviewRejected;
use App\Modules\Review\Events\ReviewUpdated;
use App\Modules\Review\Jobs\RecalculateProductRatingJob;
use App\Modules\Review\Models\Review;
use App\Modules\Review\Models\ReviewVote;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Class ReviewService
 *
 * Core domain service managing product reviews, verified purchases, moderation, and ratings.
 *
 * @package App\Modules\Review\Services
 */
class ReviewService
{
    /**
     * ReviewService constructor.
     */
    public function __construct(
        protected ReviewRepositoryInterface $reviewRepository,
        protected ReviewVoteRepositoryInterface $voteRepository,
        protected VerifiedPurchaseService $verifiedPurchaseService
    ) {}

    /**
     * Get approved reviews for a product.
     *
     * @param string $productId
     * @param array $filters
     * @param int $perPage
     * @param string $sortBy
     * @param string $sortDir
     * @return LengthAwarePaginator
     */
    public function getProductReviews(
        string $productId,
        array $filters = [],
        int $perPage = 20,
        string $sortBy = 'created_at',
        string $sortDir = 'desc'
    ): LengthAwarePaginator {
        return $this->reviewRepository->getApprovedForProduct($productId, $filters, $perPage, $sortBy, $sortDir);
    }

    /**
     * Get customer reviews.
     *
     * @param string $userId
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getCustomerReviews(string $userId, int $perPage = 20): LengthAwarePaginator
    {
        return $this->reviewRepository->getForUser($userId, $perPage);
    }

    /**
     * Get admin reviews with moderation filters.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAdminReviews(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->reviewRepository->getAdminReviews($filters, $perPage);
    }

    /**
     * Submit a customer review.
     *
     * @param CreateReviewDTO $dto
     * @return Review
     * @throws EntityNotFoundException
     * @throws BusinessRuleException
     */
    public function submitReview(CreateReviewDTO $dto): Review
    {
        $product = Product::query()->find($dto->productId);
        if ($product === null) {
            throw new EntityNotFoundException('Product', $dto->productId);
        }

        $existing = $this->reviewRepository->findByUserAndProduct($dto->userId, $dto->productId);
        if ($existing !== null) {
            throw new BusinessRuleException('You have already submitted a review for this product.', 409, 'DUPLICATE_REVIEW');
        }

        $verification = $this->verifiedPurchaseService->verifyPurchase($dto->userId, $dto->productId);

        return DB::transaction(function () use ($dto, $verification) {
            /** @var Review $review */
            $review = $this->reviewRepository->create([
                'product_id' => $dto->productId,
                'user_id' => $dto->userId,
                'order_id' => $verification['order_id'],
                'rating' => $dto->rating,
                'title' => $dto->title,
                'body' => $dto->body,
                'images' => $dto->images,
                'is_verified_purchase' => $verification['is_verified'],
                'is_approved' => false, // Always defaults to pending moderation
                'is_featured' => false,
                'helpful_count' => 0,
            ]);

            event(new ReviewCreated($review));

            return $review;
        });
    }

    /**
     * Update an existing review.
     *
     * @param string $reviewId
     * @param string $userId
     * @param UpdateReviewDTO $dto
     * @return Review
     * @throws EntityNotFoundException
     * @throws BusinessRuleException
     */
    public function updateReview(string $reviewId, string $userId, UpdateReviewDTO $dto): Review
    {
        /** @var Review|null $review */
        $review = $this->reviewRepository->findById($reviewId);
        if ($review === null) {
            throw new EntityNotFoundException('Review', $reviewId);
        }

        if ($review->user_id !== $userId) {
            throw new BusinessRuleException('You are not authorized to modify this review.', 403, 'FORBIDDEN');
        }

        $updateData = [];
        $ratingChanged = false;

        if ($dto->rating !== null) {
            $updateData['rating'] = $dto->rating;
            if ($dto->rating !== $review->rating) {
                $ratingChanged = true;
            }
        }
        if ($dto->title !== null) {
            $updateData['title'] = $dto->title;
        }
        if ($dto->body !== null) {
            $updateData['body'] = $dto->body;
        }
        if ($dto->images !== null) {
            $updateData['images'] = $dto->images;
        }

        if (!empty($updateData)) {
            /** @var Review $review */
            $review = $this->reviewRepository->update($reviewId, $updateData);
        }

        if ($ratingChanged && $review->is_approved) {
            event(new ReviewUpdated($review));
            RecalculateProductRatingJob::dispatchSync($review->product_id);
        }

        return $review;
    }

    /**
     * Delete a review.
     *
     * @param string $reviewId
     * @param string $userId
     * @param bool $isAdmin
     * @return bool
     * @throws EntityNotFoundException
     * @throws BusinessRuleException
     */
    public function deleteReview(string $reviewId, string $userId, bool $isAdmin = false): bool
    {
        /** @var Review|null $review */
        $review = $this->reviewRepository->findById($reviewId);
        if ($review === null) {
            throw new EntityNotFoundException('Review', $reviewId);
        }

        if (!$isAdmin && $review->user_id !== $userId) {
            throw new BusinessRuleException('You are not authorized to delete this review.', 403, 'FORBIDDEN');
        }

        $productId = $review->product_id;
        $wasApproved = $review->is_approved;

        $deleted = $this->reviewRepository->delete($reviewId);

        if ($deleted) {
            event(new ReviewDeleted($review));
            if ($wasApproved) {
                RecalculateProductRatingJob::dispatchSync($productId);
            }
        }

        return $deleted;
    }

    /**
     * Approve a review.
     *
     * @param string $reviewId
     * @return Review
     * @throws EntityNotFoundException
     */
    public function approveReview(string $reviewId): Review
    {
        /** @var Review|null $review */
        $review = $this->reviewRepository->findById($reviewId);
        if ($review === null) {
            throw new EntityNotFoundException('Review', $reviewId);
        }

        /** @var Review $updated */
        $updated = $this->reviewRepository->update($reviewId, [
            'is_approved' => true,
        ]);

        event(new ReviewApproved($updated));
        RecalculateProductRatingJob::dispatchSync($updated->product_id);

        return $updated;
    }

    /**
     * Reject a review.
     *
     * @param string $reviewId
     * @return Review
     * @throws EntityNotFoundException
     */
    public function rejectReview(string $reviewId): Review
    {
        /** @var Review|null $review */
        $review = $this->reviewRepository->findById($reviewId);
        if ($review === null) {
            throw new EntityNotFoundException('Review', $reviewId);
        }

        $wasApproved = $review->is_approved;

        /** @var Review $updated */
        $updated = $this->reviewRepository->update($reviewId, [
            'is_approved' => false,
        ]);

        event(new ReviewRejected($updated));

        if ($wasApproved) {
            RecalculateProductRatingJob::dispatchSync($updated->product_id);
        }

        return $updated;
    }

    /**
     * Toggle featured status of a review.
     *
     * @param string $reviewId
     * @return Review
     * @throws EntityNotFoundException
     */
    public function toggleFeatured(string $reviewId): Review
    {
        /** @var Review|null $review */
        $review = $this->reviewRepository->findById($reviewId);
        if ($review === null) {
            throw new EntityNotFoundException('Review', $reviewId);
        }

        /** @var Review $updated */
        $updated = $this->reviewRepository->update($reviewId, [
            'is_featured' => !$review->is_featured,
        ]);

        return $updated;
    }

    /**
     * Add or update store-owner reply.
     *
     * @param string $reviewId
     * @param string $reply
     * @return Review
     * @throws EntityNotFoundException
     */
    public function addAdminReply(string $reviewId, string $reply): Review
    {
        /** @var Review|null $review */
        $review = $this->reviewRepository->findById($reviewId);
        if ($review === null) {
            throw new EntityNotFoundException('Review', $reviewId);
        }

        /** @var Review $updated */
        $updated = $this->reviewRepository->update($reviewId, [
            'admin_reply' => $reply,
            'admin_reply_at' => now(),
        ]);

        return $updated;
    }

    /**
     * Cast vote on a review.
     *
     * @param string $reviewId
     * @param string $userId
     * @param ReviewVoteType $vote
     * @return ReviewVote
     * @throws EntityNotFoundException
     * @throws BusinessRuleException
     */
    public function voteReview(string $reviewId, string $userId, ReviewVoteType $vote): ReviewVote
    {
        /** @var Review|null $review */
        $review = $this->reviewRepository->findById($reviewId);
        if ($review === null) {
            throw new EntityNotFoundException('Review', $reviewId);
        }

        if ($review->user_id === $userId) {
            throw new BusinessRuleException('You cannot vote on your own review.', 422, 'SELF_VOTE_PROHIBITED');
        }

        $reviewVote = $this->voteRepository->castVote($reviewId, $userId, $vote);

        $helpfulCount = $this->voteRepository->countHelpfulVotes($reviewId);
        $this->reviewRepository->update($reviewId, [
            'helpful_count' => $helpfulCount,
        ]);

        return $reviewVote;
    }
}
