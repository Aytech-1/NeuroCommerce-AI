<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Shipping\Models\ShipZone;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface ShippingZoneRepositoryInterface
 *
 * @package App\Modules\Shipping\Contracts
 */
interface ShippingZoneRepositoryInterface extends BaseRepositoryInterface
{
    public function findZoneByCountryCode(string $countryCode): ?ShipZone;

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function getAllActiveWithRates(): Collection;
}
