<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Shipping\Contracts\ShippingRateRepositoryInterface;
use App\Modules\Shipping\Models\ShipRate;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class EloquentShippingRateRepository
 *
 * @package App\Modules\Shipping\Repositories
 */
class EloquentShippingRateRepository extends AbstractRepository implements ShippingRateRepositoryInterface
{
    public function __construct(ShipRate $model)
    {
        parent::__construct($model);
    }

    public function findMatchingRates(string $zoneId, float $weight, float $orderAmount): Collection
    {
        return $this->model->newQuery()
            ->with('zone')
            ->where('zone_id', $zoneId)
            ->where('is_active', true)
            ->where('min_weight', '<=', $weight)
            ->where(function ($q) use ($weight) {
                $q->whereNull('max_weight')->orWhere('max_weight', '>=', $weight);
            })
            ->where('min_order_amount', '<=', $orderAmount)
            ->orderBy('rate', 'asc')
            ->get();
    }

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with('zone')
            ->orderBy('carrier', 'asc')
            ->orderBy('rate', 'asc');

        if (!empty($filters['zone_id'])) {
            $query->where('zone_id', $filters['zone_id']);
        }

        if (!empty($filters['carrier'])) {
            $query->where('carrier', $filters['carrier']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->paginate($perPage);
    }
}
