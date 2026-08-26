<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Services\Gateways;

use App\Modules\Shipping\Contracts\CarrierGatewayInterface;
use App\Modules\Shipping\DTOs\CarrierShipmentResultDTO;
use App\Modules\Shipping\DTOs\CarrierTrackingDTO;
use App\Modules\Shipping\DTOs\CreateShipmentDTO;
use App\Modules\Shipping\Enums\ShipmentStatus;
use Illuminate\Support\Str;

/**
 * Class MockCarrierGateway
 *
 * @package App\Modules\Shipping\Services\Gateways
 */
class MockCarrierGateway implements CarrierGatewayInterface
{
    public function getCarrierName(): string
    {
        return 'mock_carrier';
    }

    public function createShipment(CreateShipmentDTO $dto): CarrierShipmentResultDTO
    {
        $trackingNumber = $dto->trackingNumber ?: 'TRK-' . strtoupper(Str::random(10));
        $trackingUrl = "https://tracking.neurocommerce.local/{$trackingNumber}";
        $labelUrl = "https://shipping.neurocommerce.local/labels/{$trackingNumber}.pdf";

        return new CarrierShipmentResultDTO(
            isSuccess: true,
            trackingNumber: $trackingNumber,
            trackingUrl: $trackingUrl,
            labelUrl: $labelUrl,
            cost: $dto->cost ?? 12.50,
            rawResponse: [
                'carrier' => 'mock_carrier',
                'status' => 'label_created',
                'tracking_number' => $trackingNumber,
            ]
        );
    }

    public function cancelShipment(string $trackingNumber): bool
    {
        return true;
    }

    public function fetchTracking(string $trackingNumber): CarrierTrackingDTO
    {
        return new CarrierTrackingDTO(
            trackingNumber: $trackingNumber,
            status: ShipmentStatus::IN_TRANSIT,
            events: [
                [
                    'status' => 'in_transit',
                    'location' => 'Central Hub Distribution Center',
                    'description' => 'Package scanned at sorting facility',
                    'occurred_at' => now()->toIso8601String(),
                ],
                [
                    'status' => 'label_created',
                    'location' => 'Warehouse Facility',
                    'description' => 'Shipping label generated',
                    'occurred_at' => now()->subHours(4)->toIso8601String(),
                ],
            ],
            estimatedDelivery: now()->addDays(2)->toDateString()
        );
    }
}
