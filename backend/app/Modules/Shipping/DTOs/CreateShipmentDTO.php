<?php

declare(strict_types=1);

namespace App\Modules\Shipping\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class CreateShipmentDTO
 *
 * @package App\Modules\Shipping\DTOs
 */
class CreateShipmentDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $orderId,
        public readonly string $warehouseId,
        public readonly string $carrier,
        public readonly ?string $serviceLevel = null,
        public readonly ?string $trackingNumber = null,
        public readonly ?string $trackingUrl = null,
        public readonly ?float $weight = null,
        public readonly ?float $cost = null,
        public readonly ?string $labelUrl = null
    ) {
    }
}
