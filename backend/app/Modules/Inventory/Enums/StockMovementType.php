<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Enums;

/**
 * Enum StockMovementType
 *
 * Represents all permissible stock movement classifications in the immutable ledger.
 *
 * @package App\Modules\Inventory\Enums
 */
enum StockMovementType: string
{
    case RECEIPT = 'receipt';
    case SALE = 'sale';
    case RETURN = 'return';
    case ADJUSTMENT = 'adjustment';
    case TRANSFER = 'transfer';
    case RESERVATION = 'reservation';
    case RELEASE = 'release';

    /**
     * Get a human-readable description for the movement type.
     */
    public function label(): string
    {
        return match ($this) {
            self::RECEIPT => 'Stock Receipt',
            self::SALE => 'Sale Deduction',
            self::RETURN => 'Customer Return',
            self::ADJUSTMENT => 'Manual Stock Adjustment',
            self::TRANSFER => 'Warehouse Transfer',
            self::RESERVATION => 'Order Stock Reservation',
            self::RELEASE => 'Stock Reservation Release',
        };
    }

    /**
     * Determines whether the movement typically represents an addition to physical on-hand stock.
     */
    public function isAddition(): bool
    {
        return match ($this) {
            self::RECEIPT, self::RETURN => true,
            self::SALE => false,
            self::ADJUSTMENT, self::TRANSFER, self::RESERVATION, self::RELEASE => false,
        };
    }
}
