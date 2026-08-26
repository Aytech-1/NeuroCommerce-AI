<?php

declare(strict_types=1);

namespace App\Modules\CMS\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\CMS\Contracts\PageRepositoryInterface;
use App\Modules\CMS\Models\Page;
use App\Shared\Enums\PageStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class EloquentPageRepository
 *
 * @package App\Modules\CMS\Repositories
 */
class EloquentPageRepository extends AbstractRepository implements PageRepositoryInterface
{
    public function __construct(Page $model)
    {
        parent::__construct($model);
    }

    public function findBySlug(string $slug): ?Page
    {
        return $this->model->newQuery()
            ->where('slug', $slug)
            ->first();
    }

    public function findPublishedBySlug(string $slug): ?Page
    {
        return $this->model->newQuery()
            ->published()
            ->where('slug', $slug)
            ->first();
    }

    public function getPublishedPages(int $perPage = 20): LengthAwarePaginator
    {
        return $this->model->newQuery()
            ->published()
            ->orderBy('title', 'asc')
            ->paginate($perPage);
    }

    public function paginateAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with('author');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', $search)
                    ->orWhere('slug', 'like', $search);
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function existsBySlug(string $slug, ?string $excludeId = null): bool
    {
        $query = $this->model->newQuery()->where('slug', $slug);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
