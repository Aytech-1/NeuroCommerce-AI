<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Inventory\Contracts\InventoryRepositoryInterface;
use App\Modules\Inventory\Models\InventoryItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class EloquentInventoryRepository
 *
 * @package App\Modules\Inventory\Repositories
 */
class EloquentInventoryRepository extends AbstractRepository implements InventoryRepositoryInterface
{
    public function __construct(InventoryItem $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findByProductAndWarehouse(string $productId, ?string $variantId, string $warehouseId): ?InventoryItem
    {
        $query = $this->model->newQuery()
            ->where('product_id', $productId)
            ->where('warehouse_id', $warehouseId);

        if ($variantId !== null) {
            $query->where('variant_id', $variantId);
        } else {
            $query->whereNull('variant_id');
        }

        return $query->with(['product', 'variant', 'warehouse'])->first();
    }

    /**
     * @inheritDoc
     */
    public function lockItemForUpdate(string $productId, ?string $variantId, string $warehouseId): ?InventoryItem
    {
        $query = $this->model->newQuery()
            ->where('product_id', $productId)
            ->where('warehouse_id', $warehouseId);

        if ($variantId !== null) {
            $query->where('variant_id', $variantId);
        } else {
            $query->whereNull('variant_id');
        }

        return $query->lockForUpdate()->first();
    }

    /**
     * @inheritDoc
     */
    public function findForProduct(string $productId, ?string $variantId = null): Collection
    {
        $query = $this->model->newQuery()->where('product_id', $productId);

        if ($variantId !== null) {
            $query->where('variant_id', $variantId);
        } else {
            $query->whereNull('variant_id');
        }

        return $query->with('warehouse')->get();
    }

    /**
     * @inheritDoc
     */
    public function getTotalAvailableStock(string $productId, ?string $variantId = null): int
    {
        $query = $this->model->newQuery()->where('product_id', $productId);

        if ($variantId !== null) {
            $query->where('variant_id', $variantId);
        } else {
            $query->whereNull('variant_id');
        }

        return (int) $query->selectRaw('SUM(quantity_on_hand - quantity_reserved) as total_available')
            ->value('total_available') ?? 0;
    }

    /**
     * @inheritDoc
     */
    public function paginateInventory(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['product:id,name,sku,slug', 'variant:id,name,sku', 'warehouse:id,name,code']);

        if (!empty($filters['warehouse_id'])) {
            $query->where('warehouse_id', $filters['warehouse_id']);
        }

        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (isset($filters['low_stock']) && (bool) $filters['low_stock']) {
            $query->lowStock();
        }

        if (isset($filters['out_of_stock']) && (bool) $filters['out_of_stock']) {
            $query->outOfStock();
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim((string) $filters['search']) . '%';
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'LIKE', $search)
                  ->orWhere('sku', 'LIKE', $search);
            });
        }

        $query->orderBy('updated_at', 'desc');

        return $query->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function getLowStockItems(int $perPage = 20): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->lowStock()
            ->with(['product:id,name,sku', 'variant:id,name,sku', 'warehouse:id,name,code'])
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage);
    }
}
