<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Services;

use App\Core\Abstracts\AbstractService;
use App\Modules\Inventory\Contracts\StockMovementRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class StockMovementService
 *
 * @package App\Modules\Inventory\Services
 */
class StockMovementService extends AbstractService
{
    public function __construct(
        protected StockMovementRepositoryInterface $stockMovementRepository
    ) {
    }

    public function listMovements(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->stockMovementRepository->paginateMovements($filters, $perPage);
    }

    public function getMovementsForItem(string $inventoryItemId, int $perPage = 20): LengthAwarePaginator
    {
        return $this->stockMovementRepository->getMovementsForItem($inventoryItemId, $perPage);
    }
}
