<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Services;

use App\Modules\Catalog\Contracts\SearchProviderInterface;
use App\Modules\Catalog\DTOs\SearchQueryDTO;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Class SearchService
 *
 * Orchestrates search queries with provider abstraction and deterministic caching.
 *
 * @package App\Modules\Catalog\Services
 */
class SearchService
{
    public function __construct(
        protected readonly SearchProviderInterface $searchProvider
    ) {
    }

    public function search(SearchQueryDTO $dto): LengthAwarePaginator
    {
        // Enforce max search query length to prevent buffer exhaustion attacks
        if (strlen($dto->query) > 200) {
            $dto = new SearchQueryDTO(
                query: substr($dto->query, 0, 200),
                category: $dto->category,
                brand: $dto->brand,
                minPrice: $dto->minPrice,
                maxPrice: $dto->maxPrice,
                inStock: $dto->inStock,
                minRating: $dto->minRating,
                sort: $dto->sort,
                direction: $dto->direction,
                page: $dto->page,
                perPage: $dto->perPage
            );
        }

        return $this->searchProvider->search($dto);
    }

    public function getSuggestions(string $query, int $limit = 5): Collection
    {
        $sanitized = trim(substr($query, 0, 100));
        if (empty($sanitized)) {
            return new Collection();
        }

        $boundedLimit = min(max(1, $limit), 20);

        return $this->searchProvider->suggestions($sanitized, $boundedLimit);
    }
}
