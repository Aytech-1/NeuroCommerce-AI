<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Coupon\Models\CouponUsage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface CouponUsageRepositoryInterface
 *
 * @package App\Modules\Coupon\Contracts
 */
interface CouponUsageRepositoryInterface extends BaseRepositoryInterface
{
    public function paginateForCoupon(string $couponId, int $perPage = 20): LengthAwarePaginator;

    public function recordUsage(string $couponId, ?string $userId, string $orderId, float $discountAmount): CouponUsage;
}
