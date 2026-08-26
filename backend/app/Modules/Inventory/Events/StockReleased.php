<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class StockReleased
 *
 * @package App\Modules\Inventory\Events
 */
class StockReleased
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public string $reservationId,
        public array $items,
        public string $reason
    ) {
    }
}
