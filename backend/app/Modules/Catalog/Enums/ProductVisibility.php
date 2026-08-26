<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Enums;

/**
 * Enum ProductVisibility
 *
 * Controls how and where a product is visible to customers.
 *
 * @package App\Modules\Catalog\Enums
 */
enum ProductVisibility: string
{
    case VISIBLE = 'visible';
    case HIDDEN = 'hidden';
    case SEARCH_ONLY = 'search_only';
    case CATALOG_ONLY = 'catalog_only';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::VISIBLE => 'Visible',
            self::HIDDEN => 'Hidden',
            self::SEARCH_ONLY => 'Search Only',
            self::CATALOG_ONLY => 'Catalog Only',
        };
    }
}
