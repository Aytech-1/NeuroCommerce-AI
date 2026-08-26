<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class CouponApplied
 *
 * @package App\Modules\Coupon\Events
 */
class CouponApplied
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly string $cartId,
        public readonly string $couponId,
        public readonly string $code,
        public readonly float $discountAmount,
        public readonly ?string $userId = null,
    ) {}
}
