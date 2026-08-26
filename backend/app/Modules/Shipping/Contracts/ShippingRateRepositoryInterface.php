<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Shipping\Models\ShipRate;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface ShippingRateRepositoryInterface
 *
 * @package App\Modules\Shipping\Contracts
 */
interface ShippingRateRepositoryInterface extends BaseRepositoryInterface
{
    public function findMatchingRates(string $zoneId, float $weight, float $orderAmount): Collection;

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;
}
