<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Inventory\Models\Warehouse;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface WarehouseRepositoryInterface
 *
 * @package App\Modules\Inventory\Contracts
 */
interface WarehouseRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find warehouse by unique code.
     */
    public function findByCode(string $code): ?Warehouse;

    /**
     * Get primary default warehouse for fulfillment.
     */
    public function getDefaultWarehouse(): ?Warehouse;

    /**
     * Get all active warehouses sorted by priority.
     */
    public function getAllActive(): Collection;

    /**
     * Paginate warehouses with filters.
     */
    public function paginateWarehouses(array $filters = [], int $perPage = 20): LengthAwarePaginator;
}
