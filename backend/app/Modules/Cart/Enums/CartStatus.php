<?php

declare(strict_types=1);

namespace App\Modules\Cart\Enums;

/**
 * Cart Status Enum
 *
 * Defines the lifecycle state of a customer or guest shopping cart.
 */
enum CartStatus: string
{
    case ACTIVE = 'active';
    case ABANDONED = 'abandoned';
    case MERGED = 'merged';
    case CONVERTED = 'converted';
    case EXPIRED = 'expired';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Active',
            self::ABANDONED => 'Abandoned',
            self::MERGED => 'Merged into User Cart',
            self::CONVERTED => 'Converted to Order',
            self::EXPIRED => 'Expired',
        };
    }
}
