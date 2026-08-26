<?php

declare(strict_types=1);

namespace App\Shared\Enums;

/**
 * Enum PageStatus
 *
 * Represents the publishing status of a CMS page.
 *
 * @package App\Shared\Enums
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
enum PageStatus: string
{
    case DRAFT = 'draft';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';

    /**
     * Get the human-readable label for the page status.
     *
     * @return string
     */
    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PUBLISHED => 'Published',
            self::ARCHIVED => 'Archived',
        };
    }
}
