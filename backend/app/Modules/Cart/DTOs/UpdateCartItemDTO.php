<?php

declare(strict_types=1);

namespace App\Modules\Cart\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * UpdateCartItemDTO
 */
class UpdateCartItemDTO extends AbstractDTO
{
    public function __construct(
        public readonly int $quantity,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            quantity: (int) $data['quantity'],
        );
    }
}
