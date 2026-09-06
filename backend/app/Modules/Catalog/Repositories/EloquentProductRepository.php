<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Catalog\Contracts\ProductRepositoryInterface;
use App\Modules\Catalog\Enums\ProductStatus;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductImage;
use App\Modules\Catalog\Models\ProductVariant;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Class EloquentProductRepository
 *
 * @package App\Modules\Catalog\Repositories
 */
class EloquentProductRepository extends AbstractRepository implements ProductRepositoryInterface
{
    public function __construct(Product $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findBySlug(string $slug, array $with = []): ?Product
    {
        $query = $this->model->newQuery()->where('slug', $slug);
        if (!empty($with)) {
            $query->with($with);
        }

        return $query->first();
    }

    /**
     * @inheritDoc
     */
    public function findPublicBySlug(string $slug): ?Product
    {
        return $this->model->newQuery()
            ->visible()
            ->where('slug', $slug)
            ->with([
                'category',
                'categories',
                'brand',
                'images',
                'variants.attributeValues.attribute',
                'tags',
            ])
            ->first();
    }

    /**
     * @inheritDoc
     */
    public function getPaginatedPublic(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->visible()
            ->with(['category', 'brand', 'primaryImage', 'images', 'variants']);

        $this->applyPublicFilters($query, $filters);

        return $query->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function getPaginatedAdmin(array $filters, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['category', 'brand', 'primaryImage', 'images']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['brand_id'])) {
            $query->where('brand_id', $filters['brand_id']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'LIKE', $search)
                  ->orWhere('sku', 'LIKE', $search);
            });
        }

        if (!empty($filters['sort'])) {
            $direction = str_starts_with($filters['sort'], '-') ? 'desc' : 'asc';
            $field = ltrim($filters['sort'], '-');
            if (in_array($field, ['name', 'base_price', 'created_at', 'status', 'total_sold'])) {
                $query->orderBy($field, $direction);
            }
        } else {
            $query->latest();
        }

        return $query->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function getFeatured(int $limit = 10): Collection
    {
        return $this->model->newQuery()
            ->visible()
            ->featured()
            ->with(['category', 'brand', 'primaryImage', 'images'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function getLatest(int $limit = 10): Collection
    {
        return $this->model->newQuery()
            ->visible()
            ->with(['category', 'brand', 'primaryImage', 'images'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function getPopular(int $limit = 10): Collection
    {
        return $this->model->newQuery()
            ->visible()
            ->with(['category', 'brand', 'primaryImage', 'images'])
            ->orderBy('total_sold', 'desc')
            ->orderBy('avg_rating', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function getDeals(int $perPage = 20): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->visible()
            ->onSale()
            ->with(['category', 'brand', 'primaryImage', 'images'])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function search(string $query, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $builder = $this->model->newQuery()
            ->visible()
            ->with(['category', 'brand', 'primaryImage', 'images']);

        $searchTerms = '%' . trim($query) . '%';
        $builder->where(function (Builder $q) use ($searchTerms) {
            $q->where('name', 'LIKE', $searchTerms)
              ->orWhere('short_description', 'LIKE', $searchTerms)
              ->orWhere('description', 'LIKE', $searchTerms)
              ->orWhere('sku', 'LIKE', $searchTerms);
        });

        $this->applyPublicFilters($builder, $filters);

        return $builder->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function getSearchSuggestions(string $query, int $limit = 5): Collection
    {
        return $this->model->newQuery()
            ->visible()
            ->where('name', 'LIKE', '%' . trim($query) . '%')
            ->select(['id', 'name', 'slug', 'base_price', 'category_id'])
            ->with('category:id,name,slug')
            ->limit($limit)
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function restore(string $id): bool
    {
        $product = $this->model->withTrashed()->find($id);
        if ($product) {
            return (bool) $product->restore();
        }

        return false;
    }

    /**
     * @inheritDoc
     */
    public function addVariant(string $productId, array $data, array $attributeValueIds = []): ProductVariant
    {
        return DB::transaction(function () use ($productId, $data, $attributeValueIds) {
            $data['product_id'] = $productId;
            $variant = ProductVariant::create($data);

            if (!empty($attributeValueIds)) {
                $syncData = [];
                $values = \App\Modules\Catalog\Models\AttributeValue::whereIn('id', $attributeValueIds)->get();
                foreach ($values as $val) {
                    $syncData[$val->id] = ['attribute_id' => $val->attribute_id];
                }
                $variant->attributeValues()->sync($syncData);
            }

            return $variant->load('attributeValues.attribute');
        });
    }

    /**
     * @inheritDoc
     */
    public function updateVariant(string $variantId, array $data, ?array $attributeValueIds = null): ProductVariant
    {
        return DB::transaction(function () use ($variantId, $data, $attributeValueIds) {
            $variant = ProductVariant::findOrFail($variantId);
            $variant->update($data);

            if ($attributeValueIds !== null) {
                $syncData = [];
                $values = \App\Modules\Catalog\Models\AttributeValue::whereIn('id', $attributeValueIds)->get();
                foreach ($values as $val) {
                    $syncData[$val->id] = ['attribute_id' => $val->attribute_id];
                }
                $variant->attributeValues()->sync($syncData);
            }

            return $variant->fresh('attributeValues.attribute');
        });
    }

    /**
     * @inheritDoc
     */
    public function deleteVariant(string $variantId): bool
    {
        $variant = ProductVariant::find($variantId);
        return $variant ? (bool) $variant->delete() : false;
    }

    /**
     * @inheritDoc
     */
    public function addImage(string $productId, array $data): ProductImage
    {
        $data['product_id'] = $productId;
        $hasPrimary = ProductImage::where('product_id', $productId)->where('is_primary', true)->exists();

        if (!empty($data['is_primary'])) {
            ProductImage::where('product_id', $productId)->update(['is_primary' => false]);
        } elseif (!$hasPrimary) {
            $data['is_primary'] = true;
        }

        return ProductImage::create($data);
    }

    /**
     * @inheritDoc
     */
    public function deleteImage(string $imageId): bool
    {
        $image = ProductImage::find($imageId);
        return $image ? (bool) $image->delete() : false;
    }

    /**
     * @inheritDoc
     */
    public function reorderImages(string $productId, array $imageOrders): bool
    {
        return DB::transaction(function () use ($productId, $imageOrders) {
            foreach ($imageOrders as $orderData) {
                if (isset($orderData['id'], $orderData['sort_order'])) {
                    ProductImage::where('product_id', $productId)
                        ->where('id', $orderData['id'])
                        ->update(['sort_order' => (int) $orderData['sort_order']]);
                }
            }
            return true;
        });
    }

    /**
     * Helper to apply common public filters.
     */
    private function applyPublicFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['category'])) {
            $categorySlug = $filters['category'];
            $query->whereHas('category', function (Builder $q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if (!empty($filters['brand'])) {
            $brandSlug = $filters['brand'];
            $query->whereHas('brand', function (Builder $q) use ($brandSlug) {
                $q->where('slug', $brandSlug);
            });
        }

        if (isset($filters['min_price'])) {
            $query->where('base_price', '>=', (float) $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('base_price', '<=', (float) $filters['max_price']);
        }

        if (isset($filters['is_featured'])) {
            $query->where('is_featured', (bool) $filters['is_featured']);
        }

        if (!empty($filters['sort'])) {
            $direction = str_starts_with($filters['sort'], '-') ? 'desc' : 'asc';
            $field = ltrim($filters['sort'], '-');
            if (in_array($field, ['price', 'base_price'])) {
                $query->orderBy('base_price', $direction);
            } elseif (in_array($field, ['rating', 'avg_rating'])) {
                $query->orderBy('avg_rating', $direction);
            } elseif (in_array($field, ['newest', 'created_at'])) {
                $query->orderBy('created_at', $direction);
            } elseif (in_array($field, ['popular', 'total_sold'])) {
                $query->orderBy('total_sold', $direction);
            }
        } else {
            $query->latest();
        }
    }
}
