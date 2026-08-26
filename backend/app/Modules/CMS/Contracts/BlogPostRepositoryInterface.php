<?php

declare(strict_types=1);

namespace App\Modules\CMS\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\CMS\Models\BlogPost;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface BlogPostRepositoryInterface
 *
 * @package App\Modules\CMS\Contracts
 */
interface BlogPostRepositoryInterface extends BaseRepositoryInterface
{
    public function findBySlug(string $slug): ?BlogPost;

    public function findPublishedBySlug(string $slug): ?BlogPost;

    public function getPublishedPosts(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    public function paginateAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function incrementViews(string $id): void;

    public function existsBySlug(string $slug, ?string $excludeId = null): bool;
}
