<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Enums;

/**
 * Enum ProductStatus
 *
 * Represents the publication status of a product.
 *
 * @package App\Modules\Catalog\Enums
 */
enum ProductStatus: string
{
    case DRAFT = 'draft';
    case ACTIVE = 'active';
    case ARCHIVED = 'archived';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::ACTIVE => 'Active',
            self::ARCHIVED => 'Archived',
        };
    }
}
