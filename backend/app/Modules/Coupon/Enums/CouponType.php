<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Enums;

use App\Shared\Enums\CouponType as SharedCouponType;

/**
 * Enum CouponType
 *
 * @package App\Modules\Coupon\Enums
 */
enum CouponType: string
{
    case PERCENTAGE = 'percentage';
    case FIXED_AMOUNT = 'fixed_amount';
    case FREE_SHIPPING = 'free_shipping';
    case BUY_X_GET_Y = 'buy_x_get_y';

    public function label(): string
    {
        return match ($this) {
            self::PERCENTAGE => 'Percentage',
            self::FIXED_AMOUNT => 'Fixed Amount',
            self::FREE_SHIPPING => 'Free Shipping',
            self::BUY_X_GET_Y => 'Buy X Get Y',
        };
    }
}
