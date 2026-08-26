<?php

declare(strict_types=1);

namespace App\Modules\Payment\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Payment\Contracts\RefundRepositoryInterface;
use App\Modules\Payment\Models\Refund;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class EloquentRefundRepository
 *
 * @package App\Modules\Payment\Repositories
 */
class EloquentRefundRepository extends AbstractRepository implements RefundRepositoryInterface
{
    public function __construct(Refund $model)
    {
        parent::__construct($model);
    }

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['payment', 'order.user', 'processor'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['order_id'])) {
            $query->where('order_id', $filters['order_id']);
        }

        return $query->paginate($perPage);
    }

    public function createRefund(array $data): Refund
    {
        /** @var Refund $refund */
        $refund = $this->model->newQuery()->create($data);
        return $refund;
    }
}
