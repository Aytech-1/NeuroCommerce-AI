<?php

declare(strict_types=1);

namespace App\Modules\Shipping\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Modules\Shipping\Enums\ShipmentStatus;

/**
 * Class UpdateShipmentStatusDTO
 *
 * @package App\Modules\Shipping\DTOs
 */
class UpdateShipmentStatusDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $shipmentId,
        public readonly ShipmentStatus $status,
        public readonly ?string $location = null,
        public readonly ?string $description = null
    ) {
    }
}
