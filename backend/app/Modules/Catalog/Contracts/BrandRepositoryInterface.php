<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Catalog\Models\Brand;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface BrandRepositoryInterface
 *
 * @package App\Modules\Catalog\Contracts
 */
interface BrandRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find brand by slug.
     */
    public function findBySlug(string $slug): ?Brand;

    /**
     * Get active brands for public storefront.
     */
    public function getActive(int $perPage = 50): LengthAwarePaginator;

    /**
     * Get products by brand.
     */
    public function getPublicProducts(string $slug, array $filters = [], int $perPage = 20): LengthAwarePaginator;
}
