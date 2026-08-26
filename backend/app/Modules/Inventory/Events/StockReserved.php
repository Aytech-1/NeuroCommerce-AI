<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Events;

use Carbon\CarbonInterface;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class StockReserved
 *
 * @package App\Modules\Inventory\Events
 */
class StockReserved
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public string $reservationId,
        public array $items,
        public CarbonInterface $expiresAt
    ) {
    }
}
