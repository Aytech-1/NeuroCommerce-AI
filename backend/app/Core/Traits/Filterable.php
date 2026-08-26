<?php

declare(strict_types=1);

namespace App\Core\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Trait Filterable
 *
 * Applies query filters from request parameters to Eloquent queries.
 *
 * @package App\Core\Traits
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
trait Filterable
{
    /**
     * Apply an array of filters to the query.
     * Expected format: filter[field] = value
     *
     * @param Builder $query
     * @param array<string, mixed> $filters
     * @return Builder
     */
    public function scopeFilter(Builder $query, array $filters): Builder
    {
        foreach ($filters as $field => $value) {
            if ($value !== null && $value !== '') {
                // If there's a specific method for this filter, use it.
                $methodName = 'filter' . ucfirst((string) \Illuminate\Support\Str::camel($field));
                if (method_exists($this, $methodName)) {
                    $this->{$methodName}($query, $value);
                } else {
                    $query->where($this->getTable() . '.' . $field, $value);
                }
            }
        }

        return $query;
    }

    /**
     * Apply a search term to searchable fields.
     *
     * @param Builder $query
     * @param string|null $search
     * @param array<int, string> $searchableFields
     * @return Builder
     */
    public function scopeSearch(Builder $query, ?string $search, array $searchableFields): Builder
    {
        if (empty($search) || empty($searchableFields)) {
            return $query;
        }

        $query->where(function (Builder $q) use ($search, $searchableFields) {
            foreach ($searchableFields as $field) {
                $q->orWhere($this->getTable() . '.' . $field, 'LIKE', '%' . $search . '%');
            }
        });

        return $query;
    }
}
