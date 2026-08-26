<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Events;

use App\Modules\Inventory\Models\InventoryItem;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class StockLow
 *
 * @package App\Modules\Inventory\Events
 */
class StockLow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public InventoryItem $inventoryItem,
        public int $currentAvailable,
        public int $reorderPoint
    ) {
    }
}
