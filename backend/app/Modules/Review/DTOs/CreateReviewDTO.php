<?php

declare(strict_types=1);

namespace App\Modules\Review\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class CreateReviewDTO
 *
 * Strongly typed DTO for creating a customer review.
 *
 * @package App\Modules\Review\DTOs
 */
class CreateReviewDTO extends AbstractDTO
{
    /**
     * CreateReviewDTO constructor.
     *
     * @param string $productId
     * @param string $userId
     * @param int $rating
     * @param string|null $title
     * @param string|null $body
     * @param array<string>|null $images
     */
    public function __construct(
        public readonly string $productId,
        public readonly string $userId,
        public readonly int $rating,
        public readonly ?string $title = null,
        public readonly ?string $body = null,
        public readonly ?array $images = null
    ) {}
}
