<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Events;

use App\Modules\Shipping\Models\Shipment;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class ShipmentCreated
 *
 * @package App\Modules\Shipping\Events
 */
class ShipmentCreated
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly Shipment $shipment
    ) {
    }
}
