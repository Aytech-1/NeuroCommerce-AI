<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class CouponRedeemed
 *
 * @package App\Modules\Coupon\Events
 */
class CouponRedeemed
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly string $couponId,
        public readonly string $code,
        public readonly ?string $userId,
        public readonly string $orderId,
        public readonly float $discountAmount,
    ) {}
}
