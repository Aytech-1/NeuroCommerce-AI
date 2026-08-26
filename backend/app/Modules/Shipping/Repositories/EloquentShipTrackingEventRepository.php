<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Shipping\Contracts\ShipTrackingEventRepositoryInterface;
use App\Modules\Shipping\Models\ShipTrackingEvent;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class EloquentShipTrackingEventRepository
 *
 * @package App\Modules\Shipping\Repositories
 */
class EloquentShipTrackingEventRepository extends AbstractRepository implements ShipTrackingEventRepositoryInterface
{
    public function __construct(ShipTrackingEvent $model)
    {
        parent::__construct($model);
    }

    public function getEventsForShipment(string $shipmentId): Collection
    {
        return $this->model->newQuery()
            ->where('shipment_id', $shipmentId)
            ->orderBy('occurred_at', 'desc')
            ->get();
    }

    public function recordEvent(array $data): ShipTrackingEvent
    {
        /** @var ShipTrackingEvent $event */
        $event = $this->model->newQuery()->create($data);
        return $event;
    }
}
