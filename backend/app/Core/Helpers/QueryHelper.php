<?php

declare(strict_types=1);

namespace App\Core\Helpers;

use Illuminate\Http\Request;

/**
 * Class QueryHelper
 *
 * Helps parse filter, sort, and search query parameters.
 *
 * @package App\Core\Helpers
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
class QueryHelper
{
    /**
     * Parse filters from the request.
     * Expects format: filter[field]=value
     *
     * @param Request $request
     * @return array
     */
    public static function parseFilters(Request $request): array
    {
        $filters = $request->query('filter');

        return is_array($filters) ? $filters : [];
    }

    /**
     * Parse sort fields from the request.
     * Expects format: sort=-field,field2
     *
     * @param Request $request
     * @param array $allowed
     * @return array
     */
    public static function parseSort(Request $request, array $allowed = []): array
    {
        $sortParam = $request->query('sort');

        if (empty($sortParam) || !is_string($sortParam)) {
            return [];
        }

        $sortFields = explode(',', $sortParam);
        $sorts = [];

        foreach ($sortFields as $field) {
            $direction = 'asc';
            if (str_starts_with($field, '-')) {
                $direction = 'desc';
                $field = substr($field, 1);
            }

            if (empty($allowed) || in_array($field, $allowed, true)) {
                $sorts[$field] = $direction;
            }
        }

        return $sorts;
    }

    /**
     * Parse includes from the request.
     * Expects format: include=relation1,relation2
     *
     * @param Request $request
     * @param array $allowed
     * @return array
     */
    public static function parseIncludes(Request $request, array $allowed = []): array
    {
        $includeParam = $request->query('include');

        if (empty($includeParam) || !is_string($includeParam)) {
            return [];
        }

        $includes = explode(',', $includeParam);
        
        if (empty($allowed)) {
            return $includes;
        }

        return array_intersect($includes, $allowed);
    }
}
