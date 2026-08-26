<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Enums;

/**
 * Enum StockStatus
 *
 * Qualitative availability indicators.
 *
 * @package App\Modules\Inventory\Enums
 */
enum StockStatus: string
{
    case IN_STOCK = 'in_stock';
    case LOW_STOCK = 'low_stock';
    case OUT_OF_STOCK = 'out_of_stock';
    case BACKORDER = 'backorder';

    public function label(): string
    {
        return match ($this) {
            self::IN_STOCK => 'In Stock',
            self::LOW_STOCK => 'Low Stock',
            self::OUT_OF_STOCK => 'Out of Stock',
            self::BACKORDER => 'Available on Backorder',
        };
    }
}
