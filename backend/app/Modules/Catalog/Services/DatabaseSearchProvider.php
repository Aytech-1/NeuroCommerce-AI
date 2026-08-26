<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Services;

use App\Modules\Catalog\Contracts\SearchProviderInterface;
use App\Modules\Catalog\DTOs\SearchQueryDTO;
use App\Modules\Catalog\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class DatabaseSearchProvider
 *
 * Implements native database search with full-text/LIKE matching and faceting.
 *
 * @package App\Modules\Catalog\Services
 */
class DatabaseSearchProvider implements SearchProviderInterface
{
    protected array $allowedSorts = [
        'name',
        'base_price',
        'created_at',
        'status',
        'total_sold',
        'avg_rating',
    ];

    public function search(SearchQueryDTO $dto): LengthAwarePaginator
    {
        $query = Product::query()
            ->visible()
            ->with(['category', 'brand', 'primaryImage', 'images', 'tags']);

        if (!empty($dto->query)) {
            $term = '%' . str_replace(['%', '_'], ['\%', '\_'], $dto->query) . '%';
            $query->where(function (Builder $q) use ($term, $dto) {
                // Exact SKU match gets top priority implicitly in match scoring
                $q->where('sku', 'LIKE', $term)
                  ->orWhere('name', 'LIKE', $term)
                  ->orWhere('short_description', 'LIKE', $term)
                  ->orWhere('description', 'LIKE', $term)
                  ->orWhereHas('brand', fn (Builder $b) => $b->where('name', 'LIKE', $term))
                  ->orWhereHas('category', fn (Builder $c) => $c->where('name', 'LIKE', $term))
                  ->orWhereHas('tags', fn (Builder $t) => $t->where('name', 'LIKE', $term));
            });
        }

        // Faceted filtering
        if ($dto->category) {
            $query->whereHas('category', function (Builder $q) use ($dto) {
                $q->where('slug', $dto->category)->orWhere('id', $dto->category);
            });
        }

        if ($dto->brand) {
            $query->whereHas('brand', function (Builder $q) use ($dto) {
                $q->where('slug', $dto->brand)->orWhere('id', $dto->brand);
            });
        }

        if ($dto->minPrice !== null) {
            $query->where('base_price', '>=', $dto->minPrice);
        }

        if ($dto->maxPrice !== null) {
            $query->where('base_price', '<=', $dto->maxPrice);
        }

        if ($dto->minRating !== null) {
            $query->where('avg_rating', '>=', $dto->minRating);
        }

        if ($dto->inStock !== null) {
            if ($dto->inStock) {
                $query->where('stock_status', 'in_stock');
            } else {
                $query->where('stock_status', 'out_of_stock');
            }
        }

        // Sorting
        $sortField = $dto->sort;
        if ($sortField && in_array($sortField, $this->allowedSorts, true)) {
            $query->orderBy($sortField, $dto->direction);
        } else {
            // Default sort: latest or relevance
            $query->latest('created_at');
        }

        return $query->paginate($dto->perPage, ['*'], 'page', $dto->page);
    }

    public function suggestions(string $query, int $limit = 5): Collection
    {
        if (empty(trim($query))) {
            return new Collection();
        }

        $term = '%' . str_replace(['%', '_'], ['\%', '\_'], trim($query)) . '%';

        return Product::query()
            ->visible()
            ->where(function (Builder $q) use ($term) {
                $q->where('name', 'LIKE', $term)
                  ->orWhere('sku', 'LIKE', $term);
            })
            ->select(['id', 'name', 'slug', 'sku', 'base_price', 'category_id'])
            ->with('category:id,name,slug')
            ->limit($limit)
            ->get();
    }
}
