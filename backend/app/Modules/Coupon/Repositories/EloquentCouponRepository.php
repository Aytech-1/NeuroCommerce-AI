<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Coupon\Contracts\CouponRepositoryInterface;
use App\Modules\Coupon\Models\Coupon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Class EloquentCouponRepository
 *
 * @package App\Modules\Coupon\Repositories
 */
class EloquentCouponRepository extends AbstractRepository implements CouponRepositoryInterface
{
    public function __construct(Coupon $model)
    {
        parent::__construct($model);
    }

    public function findByCode(string $code): ?Coupon
    {
        /** @var Coupon|null $coupon */
        $coupon = $this->model->newQuery()
            ->with(['rules', 'categories', 'products'])
            ->where('code', strtoupper(trim($code)))
            ->first();

        return $coupon;
    }

    public function findByCodeForUpdate(string $code): ?Coupon
    {
        /** @var Coupon|null $coupon */
        $coupon = $this->model->newQuery()
            ->lockForUpdate()
            ->with(['rules', 'categories', 'products'])
            ->where('code', strtoupper(trim($code)))
            ->first();

        return $coupon;
    }

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['rules', 'categories', 'products'])
            ->withCount('usages')
            ->orderBy('created_at', 'desc');

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim((string) $filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('code', 'LIKE', $search)
                    ->orWhere('name', 'LIKE', $search);
            });
        }

        return $query->paginate($perPage);
    }

    public function getUserUsageCount(string $couponId, string $userId): int
    {
        return DB::table('coupon_usage')
            ->where('coupon_id', $couponId)
            ->where('user_id', $userId)
            ->count();
    }
}
