<?php

declare(strict_types=1);

namespace App\Modules\Cart\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * CartSummaryDTO
 */
class CartSummaryDTO extends AbstractDTO
{
    public function __construct(
        public readonly int $itemCount,
        public readonly float $subtotal,
        public readonly float $discount,
        public readonly float $tax,
        public readonly float $shipping,
        public readonly float $total,
        public readonly string $currency,
        public readonly ?string $couponCode = null,
    ) {}
}
