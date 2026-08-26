<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Contracts;

use App\Modules\Shipping\DTOs\CarrierShipmentResultDTO;
use App\Modules\Shipping\DTOs\CarrierTrackingDTO;
use App\Modules\Shipping\DTOs\CreateShipmentDTO;

/**
 * Interface CarrierGatewayInterface
 *
 * @package App\Modules\Shipping\Contracts
 */
interface CarrierGatewayInterface
{
    public function getCarrierName(): string;

    public function createShipment(CreateShipmentDTO $dto): CarrierShipmentResultDTO;

    public function cancelShipment(string $trackingNumber): bool;

    public function fetchTracking(string $trackingNumber): CarrierTrackingDTO;
}
