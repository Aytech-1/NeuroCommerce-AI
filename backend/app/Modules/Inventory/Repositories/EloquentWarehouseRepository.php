<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Inventory\Contracts\WarehouseRepositoryInterface;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class EloquentWarehouseRepository
 *
 * @package App\Modules\Inventory\Repositories
 */
class EloquentWarehouseRepository extends AbstractRepository implements WarehouseRepositoryInterface
{
    public function __construct(Warehouse $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findByCode(string $code): ?Warehouse
    {
        return $this->model->newQuery()
            ->where('code', $code)
            ->with('address')
            ->first();
    }

    /**
     * @inheritDoc
     */
    public function getDefaultWarehouse(): ?Warehouse
    {
        return $this->model->newQuery()
            ->where('is_default', true)
            ->where('is_active', true)
            ->first() ?? $this->model->newQuery()->where('is_active', true)->orderBy('priority', 'asc')->first();
    }

    /**
     * @inheritDoc
     */
    public function getAllActive(): Collection
    {
        return $this->model->newQuery()
            ->active()
            ->orderBy('priority', 'asc')
            ->with('address')
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function paginateWarehouses(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with('address');

        if (isset($filters['is_active'])) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim((string) $filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', $search)
                  ->orWhere('code', 'LIKE', $search);
            });
        }

        $query->orderBy('priority', 'asc')->orderBy('name', 'asc');

        return $query->paginate($perPage);
    }
}
