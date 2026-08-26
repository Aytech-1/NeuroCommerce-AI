<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Inventory\Contracts\SupplierRepositoryInterface;
use App\Modules\Inventory\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class EloquentSupplierRepository
 *
 * @package App\Modules\Inventory\Repositories
 */
class EloquentSupplierRepository extends AbstractRepository implements SupplierRepositoryInterface
{
    public function __construct(Supplier $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findByCode(string $code): ?Supplier
    {
        return $this->model->newQuery()
            ->where('code', $code)
            ->with(['address', 'products'])
            ->first();
    }

    /**
     * @inheritDoc
     */
    public function paginateSuppliers(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with('address');

        if (isset($filters['is_active'])) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim((string) $filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', $search)
                  ->orWhere('code', 'LIKE', $search)
                  ->orWhere('email', 'LIKE', $search);
            });
        }

        $query->orderBy('name', 'asc');

        return $query->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function syncProducts(string $supplierId, array $productsWithPivot): void
    {
        $supplier = $this->model->findOrFail($supplierId);
        $supplier->products()->sync($productsWithPivot);
    }
}
