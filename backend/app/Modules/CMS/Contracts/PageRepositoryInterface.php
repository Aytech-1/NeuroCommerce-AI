<?php

declare(strict_types=1);

namespace App\Modules\CMS\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\CMS\Models\Page;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface PageRepositoryInterface
 *
 * @package App\Modules\CMS\Contracts
 */
interface PageRepositoryInterface extends BaseRepositoryInterface
{
    public function findBySlug(string $slug): ?Page;

    public function findPublishedBySlug(string $slug): ?Page;

    public function getPublishedPages(int $perPage = 20): LengthAwarePaginator;

    public function paginateAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function existsBySlug(string $slug, ?string $excludeId = null): bool;
}
