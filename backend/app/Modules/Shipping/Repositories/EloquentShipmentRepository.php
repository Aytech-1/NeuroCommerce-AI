<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Shipping\Contracts\ShipmentRepositoryInterface;
use App\Modules\Shipping\Models\Shipment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class EloquentShipmentRepository
 *
 * @package App\Modules\Shipping\Repositories
 */
class EloquentShipmentRepository extends AbstractRepository implements ShipmentRepositoryInterface
{
    public function __construct(Shipment $model)
    {
        parent::__construct($model);
    }

    public function findByOrderId(string $orderId): ?Shipment
    {
        /** @var Shipment|null $shipment */
        $shipment = $this->model->newQuery()
            ->with(['trackingEvents', 'warehouse', 'order.user', 'order.shippingAddress'])
            ->where('order_id', $orderId)
            ->first();

        return $shipment;
    }

    public function findByTrackingNumber(string $trackingNumber): ?Shipment
    {
        /** @var Shipment|null $shipment */
        $shipment = $this->model->newQuery()
            ->with(['trackingEvents', 'warehouse', 'order.user'])
            ->where('tracking_number', $trackingNumber)
            ->first();

        return $shipment;
    }

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['order.user', 'warehouse', 'trackingEvents'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['carrier'])) {
            $query->where('carrier', $filters['carrier']);
        }

        if (!empty($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim((string) $filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('tracking_number', 'LIKE', $search)
                    ->orWhereHas('order', function ($oq) use ($search) {
                        $oq->where('order_number', 'LIKE', $search);
                    });
            });
        }

        return $query->paginate($perPage);
    }

    public function createShipment(array $data): Shipment
    {
        /** @var Shipment $shipment */
        $shipment = $this->model->newQuery()->create($data);
        return $shipment;
    }
}
