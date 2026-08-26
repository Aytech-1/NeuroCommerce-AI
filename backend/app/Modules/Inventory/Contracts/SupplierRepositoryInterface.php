<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Inventory\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface SupplierRepositoryInterface
 *
 * @package App\Modules\Inventory\Contracts
 */
interface SupplierRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find supplier by unique vendor code.
     */
    public function findByCode(string $code): ?Supplier;

    /**
     * Paginate suppliers with filters.
     */
    public function paginateSuppliers(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    /**
     * Attach or sync products to supplier with pricing metadata.
     */
    public function syncProducts(string $supplierId, array $productsWithPivot): void;
}
