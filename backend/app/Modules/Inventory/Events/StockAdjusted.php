<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Events;

use App\Modules\Inventory\Enums\StockMovementType;
use App\Modules\Inventory\Models\InventoryItem;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class StockAdjusted
 *
 * @package App\Modules\Inventory\Events
 */
class StockAdjusted
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public InventoryItem $inventoryItem,
        public int $quantityDelta,
        public StockMovementType $movementType,
        public ?string $performedBy = null,
        public ?string $notes = null
    ) {
    }
}
