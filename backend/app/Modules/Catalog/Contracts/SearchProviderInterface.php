<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Contracts;

use App\Modules\Catalog\DTOs\SearchQueryDTO;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface SearchProviderInterface
 *
 * @package App\Modules\Catalog\Contracts
 */
interface SearchProviderInterface
{
    /**
     * Perform product search.
     *
     * @param SearchQueryDTO $dto
     * @return LengthAwarePaginator
     */
    public function search(SearchQueryDTO $dto): LengthAwarePaginator;

    /**
     * Get autocomplete/search suggestions.
     *
     * @param string $query
     * @param int $limit
     * @return Collection
     */
    public function suggestions(string $query, int $limit = 5): Collection;
}
