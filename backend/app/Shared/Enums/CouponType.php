<?php

declare(strict_types=1);

namespace App\Shared\Enums;

/**
 * Enum CouponType
 *
 * Represents the type of discount coupon.
 *
 * @package App\Shared\Enums
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
enum CouponType: string
{
    case PERCENTAGE = 'percentage';
    case FIXED_AMOUNT = 'fixed_amount';
    case FREE_SHIPPING = 'free_shipping';
    case BUY_X_GET_Y = 'buy_x_get_y';

    /**
     * Get the human-readable label for the coupon type.
     *
     * @return string
     */
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
