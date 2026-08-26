<?php

declare(strict_types=1);

namespace App\Modules\Coupon\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class RecordCouponUsageDTO
 *
 * @package App\Modules\Coupon\DTOs
 */
class RecordCouponUsageDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $couponId,
        public readonly ?string $userId,
        public readonly string $orderId,
        public readonly float $discountAmount,
    ) {}
}
