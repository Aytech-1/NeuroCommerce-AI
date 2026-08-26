<?php

declare(strict_types=1);

namespace App\Modules\Shipping\DTOs;

use App\Modules\Shipping\Enums\ShipmentStatus;

/**
 * Class CarrierTrackingDTO
 *
 * @package App\Modules\Shipping\DTOs
 */
class CarrierTrackingDTO
{
    /**
     * @param string $trackingNumber
     * @param ShipmentStatus $status
     * @param array<array{status: string, location: ?string, description: ?string, occurred_at: string}> $events
     * @param string|null $estimatedDelivery
     */
    public function __construct(
        public readonly string $trackingNumber,
        public readonly ShipmentStatus $status,
        public readonly array $events = [],
        public readonly ?string $estimatedDelivery = null
    ) {
    }
}
