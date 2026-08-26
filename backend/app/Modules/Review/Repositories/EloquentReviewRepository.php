<?php

declare(strict_types=1);

namespace App\Modules\Review\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Review\Contracts\ReviewRepositoryInterface;
use App\Modules\Review\Models\Review;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * Class EloquentReviewRepository
 *
 * @package App\Modules\Review\Repositories
 */
class EloquentReviewRepository extends AbstractRepository implements ReviewRepositoryInterface
{
    /**
     * EloquentReviewRepository constructor.
     */
    public function __construct(Review $model)
    {
        parent::__construct($model);
    }

    /**
     * {@inheritDoc}
     */
    public function getApprovedForProduct(
        string $productId,
        array $filters = [],
        int $perPage = 20,
        string $sortBy = 'created_at',
        string $sortDir = 'desc'
    ): LengthAwarePaginator {
        $query = $this->model->newQuery()
            ->with(['user:id,first_name,last_name,avatar'])
            ->where('product_id', $productId)
            ->where('is_approved', true);

        if (!empty($filters['rating'])) {
            $query->where('rating', (int) $filters['rating']);
        }

        if (isset($filters['is_verified_purchase'])) {
            $query->where('is_verified_purchase', (bool) $filters['is_verified_purchase']);
        }

        $allowedSorts = ['created_at', 'rating', 'helpful_count'];
        $sortColumn = in_array($sortBy, $allowedSorts, true) ? $sortBy : 'created_at';
        $direction = strtolower($sortDir) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($sortColumn, $direction)->paginate($perPage);
    }

    /**
     * {@inheritDoc}
     */
    public function getForUser(string $userId, int $perPage = 20): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->with(['product:id,name,slug,base_price'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * {@inheritDoc}
     */
    public function getAdminReviews(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with([
                'user:id,first_name,last_name,email,avatar',
                'product:id,name,slug,sku',
            ]);

        if (isset($filters['is_approved'])) {
            $query->where('is_approved', filter_var($filters['is_approved'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['rating'])) {
            $query->where('rating', (int) $filters['rating']);
        }

        if (isset($filters['is_featured'])) {
            $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function (Builder $q) use ($search) {
                $q->where('title', 'like', $search)
                    ->orWhere('body', 'like', $search);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * {@inheritDoc}
     */
    public function findByUserAndProduct(string $userId, string $productId): ?Review
    {
        return $this->model->newQuery()
            ->where('user_id', $userId)
            ->where('product_id', $productId)
            ->first();
    }

    /**
     * {@inheritDoc}
     */
    public function calculateProductRatingStats(string $productId): array
    {
        $approvedReviews = $this->model->newQuery()
            ->where('product_id', $productId)
            ->where('is_approved', true)
            ->get(['rating']);

        $count = $approvedReviews->count();
        if ($count === 0) {
            return [
                'average_rating' => 0.0,
                'review_count' => 0,
                'rating_distribution' => [
                    1 => 0,
                    2 => 0,
                    3 => 0,
                    4 => 0,
                    5 => 0,
                ],
            ];
        }

        $sum = $approvedReviews->sum('rating');
        $average = round((float) ($sum / $count), 2);

        $distribution = [
            1 => $approvedReviews->where('rating', 1)->count(),
            2 => $approvedReviews->where('rating', 2)->count(),
            3 => $approvedReviews->where('rating', 3)->count(),
            4 => $approvedReviews->where('rating', 4)->count(),
            5 => $approvedReviews->where('rating', 5)->count(),
        ];

        return [
            'average_rating' => $average,
            'review_count' => $count,
            'rating_distribution' => $distribution,
        ];
    }
}
