<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Inventory\Models\InventoryItem;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface InventoryRepositoryInterface
 *
 * @package App\Modules\Inventory\Contracts
 */
interface InventoryRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find item by product, optional variant, and warehouse.
     */
    public function findByProductAndWarehouse(string $productId, ?string $variantId, string $warehouseId): ?InventoryItem;

    /**
     * Lock item for update inside a transaction.
     */
    public function lockItemForUpdate(string $productId, ?string $variantId, string $warehouseId): ?InventoryItem;

    /**
     * Find all warehouse stock locations for a product/variant.
     */
    public function findForProduct(string $productId, ?string $variantId = null): Collection;

    /**
     * Calculate global available stock (all warehouses combined).
     */
    public function getTotalAvailableStock(string $productId, ?string $variantId = null): int;

    /**
     * Paginate inventory items with filters.
     */
    public function paginateInventory(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    /**
     * Get items below reorder threshold.
     */
    public function getLowStockItems(int $perPage = 20): LengthAwarePaginator;
}
