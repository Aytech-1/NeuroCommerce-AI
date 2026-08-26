<?php

declare(strict_types=1);

namespace App\Modules\Order\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Order\Contracts\OrderRepositoryInterface;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderStatusHistory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

/**
 * Class EloquentOrderRepository
 *
 * Eloquent implementation of Order repository with pagination, filtering, and history logging.
 *
 * @package App\Modules\Order\Repositories
 */
class EloquentOrderRepository extends AbstractRepository implements OrderRepositoryInterface
{
    public function __construct(Order $model)
    {
        parent::__construct($model);
    }

    public function findById(string $id, array $relations = ['items.product', 'items.variant', 'billingAddress', 'shippingAddress', 'statusHistory.changer']): ?Order
    {
        /** @var Order|null $order */
        $order = $this->model->newQuery()
            ->with($relations)
            ->where('id', $id)
            ->first();

        return $order;
    }

    public function findByOrderNumber(string $orderNumber, array $relations = ['items.product', 'items.variant', 'billingAddress', 'shippingAddress']): ?Order
    {
        /** @var Order|null $order */
        $order = $this->model->newQuery()
            ->with($relations)
            ->where('order_number', $orderNumber)
            ->first();

        return $order;
    }

    public function paginateForUser(string $userId, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->where('user_id', $userId)
            ->with(['items.product', 'billingAddress', 'shippingAddress'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($perPage);
    }

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['user', 'items', 'billingAddress', 'shippingAddress'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim((string) $filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'LIKE', $search)
                    ->orWhere('coupon_code', 'LIKE', $search)
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('email', 'LIKE', $search)
                            ->orWhere('first_name', 'LIKE', $search)
                            ->orWhere('last_name', 'LIKE', $search);
                    });
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->paginate($perPage);
    }

    public function addStatusHistory(string $orderId, ?string $fromStatus, string $toStatus, ?string $comment = null, ?string $changedBy = null): OrderStatusHistory
    {
        return OrderStatusHistory::create([
            'order_id' => $orderId,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'comment' => $comment,
            'changed_by' => $changedBy,
        ]);
    }

    public function generateOrderNumber(): string
    {
        $datePrefix = date('Ymd');
        $random = strtoupper(Str::random(6));
        $orderNumber = "NC-{$datePrefix}-{$random}";

        // Ensure absolute uniqueness
        while ($this->model->newQuery()->where('order_number', $orderNumber)->exists()) {
            $random = strtoupper(Str::random(6));
            $orderNumber = "NC-{$datePrefix}-{$random}";
        }

        return $orderNumber;
    }
}
