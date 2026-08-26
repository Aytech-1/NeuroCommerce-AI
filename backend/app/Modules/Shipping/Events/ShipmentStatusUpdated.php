<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Events;

use App\Modules\Shipping\Enums\ShipmentStatus;
use App\Modules\Shipping\Models\Shipment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class ShipmentStatusUpdated
 *
 * @package App\Modules\Shipping\Events
 */
class ShipmentStatusUpdated
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly Shipment $shipment,
        public readonly ShipmentStatus $oldStatus
    ) {
    }
}
