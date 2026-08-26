<?php

declare(strict_types=1);

namespace App\Modules\Review\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class UpdateReviewDTO
 *
 * Strongly typed DTO for updating a customer review.
 *
 * @package App\Modules\Review\DTOs
 */
class UpdateReviewDTO extends AbstractDTO
{
    /**
     * UpdateReviewDTO constructor.
     *
     * @param int|null $rating
     * @param string|null $title
     * @param string|null $body
     * @param array<string>|null $images
     */
    public function __construct(
        public readonly ?int $rating = null,
        public readonly ?string $title = null,
        public readonly ?string $body = null,
        public readonly ?array $images = null
    ) {}
}
