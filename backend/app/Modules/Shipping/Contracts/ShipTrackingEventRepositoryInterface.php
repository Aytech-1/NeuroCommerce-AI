<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Shipping\Models\ShipTrackingEvent;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface ShipTrackingEventRepositoryInterface
 *
 * @package App\Modules\Shipping\Contracts
 */
interface ShipTrackingEventRepositoryInterface extends BaseRepositoryInterface
{
    public function getEventsForShipment(string $shipmentId): Collection;

    public function recordEvent(array $data): ShipTrackingEvent;
}
