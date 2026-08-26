<?php

declare(strict_types=1);

namespace App\Modules\Review\Enums;

/**
 * Enum ReviewVoteType
 *
 * Represents the type of vote cast on a product review.
 *
 * @package App\Modules\Review\Enums
 */
enum ReviewVoteType: string
{
    case HELPFUL = 'helpful';
    case NOT_HELPFUL = 'not_helpful';

    /**
     * Get the human-readable label for the vote type.
     *
     * @return string
     */
    public function label(): string
    {
        return match ($this) {
            self::HELPFUL => 'Helpful',
            self::NOT_HELPFUL => 'Not Helpful',
        };
    }
}
