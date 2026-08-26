<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Coupon\Models\DiscountRule;
use Illuminate\Support\Collection;

/**
 * Interface DiscountRuleRepositoryInterface
 *
 * @package App\Modules\Coupon\Contracts
 */
interface DiscountRuleRepositoryInterface extends BaseRepositoryInterface
{
    public function getRulesForCoupon(string $couponId): Collection;

    public function syncRulesForCoupon(string $couponId, array $rules): void;
}
