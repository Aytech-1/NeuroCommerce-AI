<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Inventory\Models\StockMovement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface StockMovementRepositoryInterface
 *
 * @package App\Modules\Inventory\Contracts
 */
interface StockMovementRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Paginate immutable stock movement ledger records.
     */
    public function paginateMovements(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    /**
     * Record a new stock movement.
     */
    public function recordMovement(array $data): StockMovement;

    /**
     * Get movements for a specific inventory item.
     */
    public function getMovementsForItem(string $inventoryItemId, int $perPage = 20): LengthAwarePaginator;
}
