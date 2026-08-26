<?php

declare(strict_types=1);

namespace App\Modules\Review\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Review\Models\Review;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface ReviewRepositoryInterface
 *
 * @package App\Modules\Review\Contracts
 */
interface ReviewRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Get approved reviews for a product with pagination.
     *
     * @param string $productId
     * @param array $filters
     * @param int $perPage
     * @param string $sortBy
     * @param string $sortDir
     * @return LengthAwarePaginator
     */
    public function getApprovedForProduct(
        string $productId,
        array $filters = [],
        int $perPage = 20,
        string $sortBy = 'created_at',
        string $sortDir = 'desc'
    ): LengthAwarePaginator;

    /**
     * Get customer's reviews with pagination.
     *
     * @param string $userId
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getForUser(string $userId, int $perPage = 20): LengthAwarePaginator;

    /**
     * Get admin reviews with filters and pagination.
     *
     * @param array $filters
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAdminReviews(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    /**
     * Find review by user and product.
     *
     * @param string $userId
     * @param string $productId
     * @return Review|null
     */
    public function findByUserAndProduct(string $userId, string $productId): ?Review;

    /**
     * Calculate aggregate rating metrics for a product.
     *
     * @param string $productId
     * @return array{average_rating: float, review_count: int, rating_distribution: array<int, int>}
     */
    public function calculateProductRatingStats(string $productId): array;
}
