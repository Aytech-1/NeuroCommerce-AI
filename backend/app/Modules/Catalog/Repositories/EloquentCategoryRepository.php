<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Catalog\Contracts\CategoryRepositoryInterface;
use App\Modules\Catalog\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Class EloquentCategoryRepository
 *
 * @package App\Modules\Catalog\Repositories
 */
class EloquentCategoryRepository extends AbstractRepository implements CategoryRepositoryInterface
{
    public function __construct(Category $model)
    {
        parent::__construct($model);
    }

    /**
     * @inheritDoc
     */
    public function findBySlug(string $slug): ?Category
    {
        return $this->model->newQuery()
            ->where('slug', $slug)
            ->withCount('products')
            ->with(['parent', 'children' => fn ($q) => $q->active()->withCount('products')])
            ->first();
    }

    /**
     * @inheritDoc
     */
    public function getTree(): Collection
    {
        return $this->model->newQuery()
            ->active()
            ->root()
            ->withCount('products')
            ->with([
                'children' => function ($query) {
                    $query->active()
                        ->withCount('products')
                        ->orderBy('sort_order', 'asc')
                        ->with(['children' => fn ($q) => $q->active()->withCount('products')->orderBy('sort_order', 'asc')]);
                },
            ])
            ->orderBy('sort_order', 'asc')
            ->get();
    }

    /**
     * @inheritDoc
     */
    public function getPublicProducts(string $slug, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $category = $this->findBySlug($slug);
        if (!$category) {
            return new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage);
        }

        // Collect current category ID plus children IDs
        $categoryIds = [$category->id];
        if ($category->children()->exists()) {
            $childIds = $category->children()->pluck('id')->toArray();
            $categoryIds = array_merge($categoryIds, $childIds);
        }

        $query = \App\Modules\Catalog\Models\Product::query()
            ->visible()
            ->where(function (Builder $q) use ($categoryIds) {
                $q->whereIn('category_id', $categoryIds)
                  ->orWhereHas('categories', function (Builder $sq) use ($categoryIds) {
                      $sq->whereIn('categories.id', $categoryIds);
                  });
            })
            ->with(['category', 'brand', 'primaryImage', 'images']);

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

    /**
     * @inheritDoc
     */
    public function reorderTree(array $nodes): bool
    {
        return DB::transaction(function () use ($nodes) {
            foreach ($nodes as $node) {
                if (isset($node['id'])) {
                    $update = [];
                    if (isset($node['sort_order'])) {
                        $update['sort_order'] = (int) $node['sort_order'];
                    }
                    if (array_key_exists('parent_id', $node)) {
                        $update['parent_id'] = $node['parent_id'];
                    }
                    if (isset($node['depth'])) {
                        $update['depth'] = (int) $node['depth'];
                    }
                    if (!empty($update)) {
                        Category::where('id', $node['id'])->update($update);
                    }
                }
            }
            return true;
        });
    }
}
