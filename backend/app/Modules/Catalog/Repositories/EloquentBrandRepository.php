<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Catalog\Contracts\BrandRepositoryInterface;
use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

/**
 * Class EloquentBrandRepository
 *
 * @package App\Modules\Catalog\Repositories
 */
class EloquentBrandRepository extends AbstractRepository implements BrandRepositoryInterface
{
    public function __construct(Brand $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findBySlug(string $slug): ?Brand
    {
        return $this->model->newQuery()
            ->where('slug', $slug)
            ->first();
    }

    /**
     * @inheritDoc
     */
    public function getActive(int $perPage = 50): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->active()
            ->orderBy('sort_order', 'asc')
            ->orderBy('name', 'asc')
            ->paginate($perPage);
    }

    /**
     * @inheritDoc
     */
    public function getPublicProducts(string $slug, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $brand = $this->findBySlug($slug);
        if (!$brand) {
            return new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage);
        }

        $query = Product::query()
            ->visible()
            ->where('brand_id', $brand->id)
            ->with(['category', 'brand', 'primaryImage', 'images']);

        if (!empty($filters['category'])) {
            $categorySlug = $filters['category'];
            $query->whereHas('category', function (Builder $q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if (isset($filters['min_price'])) {
            $query->where('base_price', '>=', (float) $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('base_price', '<=', (float) $filters['max_price']);
        }

        if (!empty($filters['sort'])) {
            $direction = str_starts_with($filters['sort'], '-') ? 'desc' : 'asc';
            $field = ltrim($filters['sort'], '-');
            if (in_array($field, ['price', 'base_price'])) {
                $query->orderBy('base_price', $direction);
            } elseif (in_array($field, ['rating', 'avg_rating'])) {
                $query->orderBy('avg_rating', $direction);
            } else {
                $query->latest();
            }
        } else {
            $query->latest();
        }

        return $query->paginate($perPage);
    }
}
