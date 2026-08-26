<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Jobs;

use App\Modules\Shipping\Contracts\ShipmentRepositoryInterface;
use App\Modules\Shipping\Contracts\ShipTrackingEventRepositoryInterface;
use App\Modules\Shipping\DTOs\UpdateShipmentStatusDTO;
use App\Modules\Shipping\Enums\ShipmentStatus;
use App\Modules\Shipping\Models\Shipment;
use App\Modules\Shipping\Services\Gateways\CarrierGatewayManager;
use App\Modules\Shipping\Services\ShipmentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class SyncCarrierTrackingJob
 *
 * @package App\Modules\Shipping\Jobs
 */
class SyncCarrierTrackingJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(
        public readonly string $shipmentId
    ) {
    }

    public function handle(
        ShipmentRepositoryInterface $shipmentRepository,
        CarrierGatewayManager $carrierManager,
        ShipmentService $shipmentService
    ): void {
        /** @var Shipment|null $shipment */
        $shipment = $shipmentRepository->findById($this->shipmentId);

        if (!$shipment || !$shipment->tracking_number || $shipment->status->isTerminal()) {
            return;
        }

        try {
            $gateway = $carrierManager->gateway($shipment->carrier);
            $tracking = $gateway->fetchTracking($shipment->tracking_number);

            if ($tracking->status !== $shipment->status) {
                $shipmentService->updateShipmentStatus(new UpdateShipmentStatusDTO(
                    shipmentId: $shipment->id,
                    status: $tracking->status,
                    location: $tracking->events[0]['location'] ?? null,
                    description: $tracking->events[0]['description'] ?? 'Synced tracking update from carrier.'
                ));
            }
        } catch (\Throwable $e) {
            Log::warning("Failed to sync carrier tracking for shipment {$this->shipmentId}: {$e->getMessage()}");
            throw $e;
        }
    }
}
