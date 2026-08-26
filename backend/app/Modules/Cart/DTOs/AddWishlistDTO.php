<?php

declare(strict_types=1);

namespace App\Modules\Cart\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * AddWishlistDTO
 */
class AddWishlistDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $productId,
        public readonly ?string $variantId = null,
        public readonly ?string $notes = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            productId: (string) $data['product_id'],
            variantId: isset($data['variant_id']) ? (string) $data['variant_id'] : null,
            notes: isset($data['notes']) ? (string) $data['notes'] : null,
        );
    }
}
