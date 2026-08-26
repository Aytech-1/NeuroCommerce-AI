<?php

declare(strict_types=1);

namespace App\Modules\CMS\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\CMS\Contracts\BlogPostRepositoryInterface;
use App\Modules\CMS\Models\BlogPost;
use App\Shared\Enums\PageStatus;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class EloquentBlogPostRepository
 *
 * @package App\Modules\CMS\Repositories
 */
class EloquentBlogPostRepository extends AbstractRepository implements BlogPostRepositoryInterface
{
    public function __construct(BlogPost $model)
    {
        parent::__construct($model);
    }

    public function findBySlug(string $slug): ?BlogPost
    {
        return $this->model->newQuery()
            ->where('slug', $slug)
            ->first();
    }

    public function findPublishedBySlug(string $slug): ?BlogPost
    {
        return $this->model->newQuery()
            ->published()
            ->where('slug', $slug)
            ->first();
    }

    public function getPublishedPosts(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->published()->with('author');

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['is_featured'])) {
            $query->where('is_featured', filter_var($filters['is_featured'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('published_at', 'desc')->paginate($perPage);
    }

    public function paginateAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()->with('author');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
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

    public function incrementViews(string $id): void
    {
        $this->model->newQuery()
            ->where('id', $id)
            ->increment('view_count');
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
