<?php

declare(strict_types=1);

namespace App\Modules\Cart\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * CartItemRemoved Domain Event
 */
class CartItemRemoved
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly string $cartId,
        public readonly string $productId,
        public readonly ?string $variantId = null,
        public readonly ?string $userId = null,
        public readonly ?string $sessionId = null,
    ) {}
}
