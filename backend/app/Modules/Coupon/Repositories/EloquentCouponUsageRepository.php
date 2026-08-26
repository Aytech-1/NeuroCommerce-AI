<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Coupon\Contracts\CouponUsageRepositoryInterface;
use App\Modules\Coupon\Models\CouponUsage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class EloquentCouponUsageRepository
 *
 * @package App\Modules\Coupon\Repositories
 */
class EloquentCouponUsageRepository extends AbstractRepository implements CouponUsageRepositoryInterface
{
    public function __construct(CouponUsage $model)
    {
        parent::__construct($model);
    }

    public function paginateForCoupon(string $couponId, int $perPage = 20): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->with(['user', 'order'])
            ->where('coupon_id', $couponId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function recordUsage(string $couponId, ?string $userId, string $orderId, float $discountAmount): CouponUsage
    {
        /** @var CouponUsage $usage */
        $usage = $this->model->newQuery()->create([
            'coupon_id' => $couponId,
            'user_id' => $userId,
            'order_id' => $orderId,
            'discount_amount' => $discountAmount,
        ]);

        return $usage;
    }
}
