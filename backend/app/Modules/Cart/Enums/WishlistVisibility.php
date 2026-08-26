<?php

declare(strict_types=1);

namespace App\Modules\Cart\Enums;

/**
 * Wishlist Visibility Enum
 */
enum WishlistVisibility: string
{
    case PRIVATE = 'private';
    case PUBLIC = 'public';
    case SHARED = 'shared';

    public function label(): string
    {
        return match ($this) {
            self::PRIVATE => 'Private',
            self::PUBLIC => 'Public',
            self::SHARED => 'Shared via Link',
        };
    }
}
