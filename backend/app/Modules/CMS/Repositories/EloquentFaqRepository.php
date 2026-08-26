<?php

declare(strict_types=1);

namespace App\Modules\CMS\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\CMS\Contracts\FaqRepositoryInterface;
use App\Modules\CMS\Models\Faq;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class EloquentFaqRepository
 *
 * @package App\Modules\CMS\Repositories
 */
class EloquentFaqRepository extends AbstractRepository implements FaqRepositoryInterface
{
    public function __construct(Faq $model)
    {
        parent::__construct($model);
    }

    public function getActiveFaqs(?string $category = null): Collection
    {
        $query = $this->model->newQuery()->active()->orderBy('sort_order', 'asc');

        if ($category !== null) {
            $query->category($category);
        }

        return $query->get();
    }

    public function paginateAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', $search)
                    ->orWhere('answer', 'like', $search);
            });
        }

        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
