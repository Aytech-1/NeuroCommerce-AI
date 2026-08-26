<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Coupon\Models\Coupon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface CouponRepositoryInterface
 *
 * @package App\Modules\Coupon\Contracts
 */
interface CouponRepositoryInterface extends BaseRepositoryInterface
{
    public function findByCode(string $code): ?Coupon;

    public function findByCodeForUpdate(string $code): ?Coupon;

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function getUserUsageCount(string $couponId, string $userId): int;
}
