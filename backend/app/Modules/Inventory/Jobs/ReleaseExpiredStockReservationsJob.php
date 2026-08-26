<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Jobs;

use App\Modules\Inventory\Services\InventoryService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Class ReleaseExpiredStockReservationsJob
 *
 * Scans active stock reservations and releases any that have exceeded the 15-minute TTL.
 *
 * @package App\Modules\Inventory\Jobs
 */
class ReleaseExpiredStockReservationsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    public function handle(InventoryService $inventoryService): void
    {
        $activeReservationIds = Cache::get('inventory:active_reservations', []);
        $now = now()->timestamp;
        $remainingReservations = [];

        foreach ($activeReservationIds as $reservationId) {
            $reservation = Cache::get("inventory:reservation:{$reservationId}");

            if (!$reservation) {
                // Key expired in cache or already released/deducted
                continue;
            }

            if ($reservation['expires_at'] <= $now) {
                // Expired — trigger release
                try {
                    $inventoryService->releaseStock($reservationId, 'Reservation TTL expired');
                    Log::info("Released expired stock reservation: {$reservationId}");
                } catch (\Throwable $e) {
                    Log::error("Failed to release expired reservation {$reservationId}: " . $e->getMessage());
                }
            } else {
                $remainingReservations[] = $reservationId;
            }
        }

        Cache::forever('inventory:active_reservations', $remainingReservations);
    }
}
