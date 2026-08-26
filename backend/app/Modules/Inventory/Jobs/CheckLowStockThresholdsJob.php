<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Jobs;

use App\Modules\Inventory\Contracts\InventoryRepositoryInterface;
use App\Modules\Inventory\Events\StockLow;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class CheckLowStockThresholdsJob
 *
 * Scans inventory items nearing exhaustion and fires StockLow domain events.
 *
 * @package App\Modules\Inventory\Jobs
 */
class CheckLowStockThresholdsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function handle(InventoryRepositoryInterface $inventoryRepo): void
    {
        $lowStockItems = $inventoryRepo->getLowStockItems(100);

        foreach ($lowStockItems as $item) {
            event(new StockLow(
                inventoryItem: $item,
                currentAvailable: $item->quantity_available,
                reorderPoint: $item->reorder_point
            ));
        }

        Log::info("CheckLowStockThresholdsJob completed. Processed {$lowStockItems->total()} low-stock records.");
    }
}
