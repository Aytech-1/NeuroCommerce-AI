<?php

declare(strict_types=1);

namespace App\Core\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Trait Sortable
 *
 * Applies sorting from request parameters.
 * Supports standard sorting 'field' (asc) and '-field' (desc).
 *
 * @package App\Core\Traits
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
trait Sortable
{
    /**
     * Apply sorting to the query.
     *
     * @param Builder $query
     * @param string|null $sort
     * @param array<int, string> $allowedSorts
     * @return Builder
     */
    public function scopeSort(Builder $query, ?string $sort, array $allowedSorts = []): Builder
    {
        if (empty($sort)) {
            return $query;
        }

        // Support multiple comma-separated sorts
        $sorts = explode(',', $sort);

        foreach ($sorts as $sortField) {
            $sortField = trim($sortField);
            
            if (empty($sortField)) {
                continue;
            }

            $direction = 'asc';

            if (str_starts_with($sortField, '-')) {
                $direction = 'desc';
                $sortField = substr($sortField, 1);
            }

            if (!empty($allowedSorts) && !in_array($sortField, $allowedSorts, true)) {
                continue;
            }

            $query->orderBy($this->getTable() . '.' . $sortField, $direction);
        }

        return $query;
    }
}
