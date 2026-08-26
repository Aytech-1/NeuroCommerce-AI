<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Inventory\Contracts\StockMovementRepositoryInterface;
use App\Modules\Inventory\Models\StockMovement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class EloquentStockMovementRepository
 *
 * @package App\Modules\Inventory\Repositories
 */
class EloquentStockMovementRepository extends AbstractRepository implements StockMovementRepositoryInterface
{
    public function __construct(StockMovement $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function paginateMovements(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['inventoryItem.product:id,name,sku', 'inventoryItem.variant:id,name,sku', 'inventoryItem.warehouse:id,name,code', 'performer:id,first_name,last_name,email']);

        if (!empty($filters['movement_type'])) {
            $query->where('movement_type', $filters['movement_type']);
        }

        if (!empty($filters['inventory_item_id'])) {
            $query->where('inventory_item_id', $filters['inventory_item_id']);
        }

        if (!empty($filters['warehouse_id'])) {
            $query->whereHas('inventoryItem', fn ($q) => $q->where('warehouse_id', $filters['warehouse_id']));
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        $query->orderBy('created_at', 'desc');

        return $query->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function recordMovement(array $data): StockMovement
    {
        return $this->model->newQuery()->create($data);
    }

    /**
     * @inheritDoc
     */
    public function getMovementsForItem(string $inventoryItemId, int $perPage = 20): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->where('inventory_item_id', $inventoryItemId)
            ->with('performer:id,first_name,last_name,email')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
