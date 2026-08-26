<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Catalog\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface CategoryRepositoryInterface
 *
 * @package App\Modules\Catalog\Contracts
 */
interface CategoryRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find category by slug.
     */
    public function findBySlug(string $slug): ?Category;

    /**
     * Get complete hierarchical category tree.
     */
    public function getTree(): Collection;

    /**
     * Get products in category (including descendant categories if nested).
     */
    public function getPublicProducts(string $slug, array $filters = [], int $perPage = 20): LengthAwarePaginator;

    /**
     * Rebuild / reorder category tree hierarchy.
     */
    public function reorderTree(array $nodes): bool;
}
