<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductImage;
use App\Modules\Catalog\Models\ProductVariant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface ProductRepositoryInterface
 *
 * @package App\Modules\Catalog\Contracts
 */
interface ProductRepositoryInterface extends BaseRepositoryInterface
{
    /**
     * Find product by slug with optional relations.
     */
    public function findBySlug(string $slug, array $with = []): ?Product;

    /**
     * Find public visible product by slug.
     */
    public function findPublicBySlug(string $slug): ?Product;

    /**
     * Get paginated public products with search, category, brand, and attribute filtering.
     */
    public function getPaginatedPublic(array $filters, int $perPage = 20): LengthAwarePaginator;

    /**
     * Get paginated admin products.
     */
    public function getPaginatedAdmin(array $filters, int $perPage = 20): LengthAwarePaginator;

    /**
     * Get featured products.
     */
    public function getFeatured(int $limit = 10): Collection;

    /**
     * Get latest published products.
     */
    public function getLatest(int $limit = 10): Collection;

    /**
     * Get popular products.
     */
    public function getPopular(int $limit = 10): Collection;

    /**
     * Get discounted/deal products.
     */
    public function getDeals(int $perPage = 20): LengthAwarePaginator;

    /**
     * Search products by keyword across title, description, short_description.
     */
    public function search(string $query, array $filters = [], int $perPage = 20): LengthAwarePaginator;

    /**
     * Get search autocomplete suggestions.
     */
    public function getSearchSuggestions(string $query, int $limit = 5): Collection;

    /**
     * Restore soft-deleted product.
     */
    public function restore(string $id): bool;

    /**
     * Add variant to product.
     */
    public function addVariant(string $productId, array $data, array $attributeValueIds = []): ProductVariant;

    /**
     * Update product variant.
     */
    public function updateVariant(string $variantId, array $data, ?array $attributeValueIds = null): ProductVariant;

    /**
     * Delete product variant.
     */
    public function deleteVariant(string $variantId): bool;

    /**
     * Add gallery image.
     */
    public function addImage(string $productId, array $data): ProductImage;

    /**
     * Delete gallery image.
     */
    public function deleteImage(string $imageId): bool;

    /**
     * Reorder gallery images.
     */
    public function reorderImages(string $productId, array $imageOrders): bool;
}
