<?php

declare(strict_types=1);

namespace App\Modules\Cart\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * AddCartItemDTO
 */
class AddCartItemDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $productId,
        public readonly ?string $variantId = null,
        public readonly int $quantity = 1,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            productId: (string) $data['product_id'],
            variantId: isset($data['variant_id']) ? (string) $data['variant_id'] : null,
            quantity: isset($data['quantity']) ? (int) $data['quantity'] : 1,
        );
    }
}
