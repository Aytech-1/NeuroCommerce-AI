<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Enums;

/**
 * Enum DiscountRuleType
 *
 * @package App\Modules\Coupon\Enums
 */
enum DiscountRuleType: string
{
    case PRODUCT = 'product';
    case CATEGORY = 'category';
    case BRAND = 'brand';
    case CUSTOMER_GROUP = 'customer_group';
    case MINIMUM_QUANTITY = 'minimum_quantity';

    public function label(): string
    {
        return match ($this) {
            self::PRODUCT => 'Product Restriction',
            self::CATEGORY => 'Category Restriction',
            self::BRAND => 'Brand Restriction',
            self::CUSTOMER_GROUP => 'Customer Group',
            self::MINIMUM_QUANTITY => 'Minimum Quantity',
        };
    }
}
