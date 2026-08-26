<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Shipping\Contracts\ShippingZoneRepositoryInterface;
use App\Modules\Shipping\Models\ShipZone;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Class EloquentShippingZoneRepository
 *
 * @package App\Modules\Shipping\Repositories
 */
class EloquentShippingZoneRepository extends AbstractRepository implements ShippingZoneRepositoryInterface
{
    public function __construct(ShipZone $model)
    {
        parent::__construct($model);
    }

    public function findZoneByCountryCode(string $countryCode): ?ShipZone
    {
        $zoneId = DB::table('ship_zone_countries')
            ->where('country_code', strtoupper(trim($countryCode)))
            ->value('zone_id');

        if (!$zoneId) {
            return null;
        }

        /** @var ShipZone|null $zone */
        $zone = $this->model->newQuery()
            ->with('rates')
            ->where('id', $zoneId)
            ->where('is_active', true)
            ->first();

        return $zone;
    }

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with('rates')
            ->orderBy('name', 'asc');

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim((string) $filters['search']) . '%';
            $query->where('name', 'LIKE', $search);
        }

        return $query->paginate($perPage);
    }

    public function getAllActiveWithRates(): Collection
    {
        return $this->model->newQuery()
            ->with(['rates' => fn ($q) => $q->where('is_active', true)])
            ->where('is_active', true)
            ->get();
    }
}
