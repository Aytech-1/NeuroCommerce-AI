<?php

declare(strict_types=1);

namespace App\Modules\Catalog\DTOs;

/**
 * Class SearchQueryDTO
 *
 * @package App\Modules\Catalog\DTOs
 */
readonly class SearchQueryDTO
{
    public function __construct(
        public string $query = '',
        public ?string $category = null,
        public ?string $brand = null,
        public ?float $minPrice = null,
        public ?float $maxPrice = null,
        public ?bool $inStock = null,
        public ?float $minRating = null,
        public ?string $sort = null,
        public string $direction = 'asc',
        public int $page = 1,
        public int $perPage = 20
    ) {
    }

    public static function fromArray(array $data): self
    {
        $sortParam = $data['sort'] ?? null;
        $direction = 'asc';
        $sortField = null;

        if ($sortParam) {
            if (str_starts_with($sortParam, '-')) {
                $direction = 'desc';
                $sortField = substr($sortParam, 1);
            } else {
                $sortField = $sortParam;
            }
        }

        $filters = $data['filter'] ?? [];

        return new self(
            query: trim((string) ($data['q'] ?? $data['search'] ?? '')),
            category: $filters['category'] ?? $data['category'] ?? null,
            brand: $filters['brand'] ?? $data['brand'] ?? null,
            minPrice: isset($filters['min_price']) ? (float) $filters['min_price'] : (isset($data['min_price']) ? (float) $data['min_price'] : null),
            maxPrice: isset($filters['max_price']) ? (float) $filters['max_price'] : (isset($data['max_price']) ? (float) $data['max_price'] : null),
            inStock: isset($filters['in_stock']) ? filter_var($filters['in_stock'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) : null,
            minRating: isset($filters['rating']) ? (float) $filters['rating'] : (isset($data['rating']) ? (float) $data['rating'] : null),
            sort: $sortField,
            direction: $direction,
            page: max(1, (int) ($data['page'] ?? 1)),
            perPage: min(100, max(1, (int) ($data['per_page'] ?? 20)))
        );
    }
}
