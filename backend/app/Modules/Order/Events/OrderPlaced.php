<?php

declare(strict_types=1);

namespace App\Modules\Order\Events;

use App\Modules\Order\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class OrderPlaced
 *
 * Emitted when an order has completed checkout saga.
 *
 * @package App\Modules\Order\Events
 */
class OrderPlaced
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly Order $order
    ) {
    }
}
