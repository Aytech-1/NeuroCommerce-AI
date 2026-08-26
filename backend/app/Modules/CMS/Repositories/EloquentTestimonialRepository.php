<?php

declare(strict_types=1);

namespace App\Modules\CMS\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\CMS\Contracts\TestimonialRepositoryInterface;
use App\Modules\CMS\Models\Testimonial;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class EloquentTestimonialRepository
 *
 * @package App\Modules\CMS\Repositories
 */
class EloquentTestimonialRepository extends AbstractRepository implements TestimonialRepositoryInterface
{
    public function __construct(Testimonial $model)
    {
        parent::__construct($model);
    }

    public function getActiveTestimonials(): Collection
    {
        return $this->model->newQuery()
            ->active()
            ->orderBy('sort_order', 'asc')
            ->get();
    }

    public function paginateAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery();

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['search'])) {
            $search = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', $search)
                    ->orWhere('company', 'like', $search)
                    ->orWhere('content', 'like', $search);
            });
        }

        return $query->orderBy('sort_order', 'asc')->orderBy('created_at', 'desc')->paginate($perPage);
    }
}
