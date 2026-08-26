<?php

declare(strict_types=1);

namespace App\Core\Helpers;

use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Class PaginationHelper
 *
 * Standardizes pagination extraction from requests.
 *
 * @package App\Core\Helpers
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
class PaginationHelper
{
    /**
     * Get the number of items per page.
     *
     * @param Request $request
     * @param int $default
     * @param int $max
     * @return int
     */
    public static function getPerPage(Request $request, int $default = 20, int $max = 100): int
    {
        $perPage = (int) $request->query('per_page', $default);

        if ($perPage < 1) {
            return $default;
        }

        return $perPage > $max ? $max : $perPage;
    }

    /**
     * Get the current page number.
     *
     * @param Request $request
     * @param int $default
     * @return int
     */
    public static function getPage(Request $request, int $default = 1): int
    {
        $page = (int) $request->query('page', $default);
        return $page < 1 ? $default : $page;
    }

    /**
     * Get the pagination cursor.
     *
     * @param Request $request
     * @return string|null
     */
    public static function getCursor(Request $request): ?string
    {
        return $request->query('cursor');
    }

    /**
     * Build meta information for pagination.
     *
     * @param LengthAwarePaginator $paginator
     * @return array
     */
    public static function buildMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'per_page'     => $paginator->perPage(),
            'total'        => $paginator->total(),
            'last_page'    => $paginator->lastPage(),
        ];
    }

    /**
     * Build links for pagination.
     *
     * @param LengthAwarePaginator $paginator
     * @return array
     */
    public static function buildLinks(LengthAwarePaginator $paginator): array
    {
        return [
            'first' => $paginator->url(1),
            'last'  => $paginator->url($paginator->lastPage()),
            'prev'  => $paginator->previousPageUrl(),
            'next'  => $paginator->nextPageUrl(),
        ];
    }
}
