<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Shipping\Models\Shipment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface ShipmentRepositoryInterface
 *
 * @package App\Modules\Shipping\Contracts
 */
interface ShipmentRepositoryInterface extends BaseRepositoryInterface
{
    public function findByOrderId(string $orderId): ?Shipment;

    public function findByTrackingNumber(string $trackingNumber): ?Shipment;

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function createShipment(array $data): Shipment;
}
