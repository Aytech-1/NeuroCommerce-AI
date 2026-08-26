<?php

declare(strict_types=1);

namespace App\Modules\Payment\Repositories;

use App\Core\Abstracts\AbstractRepository;
use App\Modules\Payment\Contracts\PaymentRepositoryInterface;
use App\Modules\Payment\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Class EloquentPaymentRepository
 *
 * @package App\Modules\Payment\Repositories
 */
class EloquentPaymentRepository extends AbstractRepository implements PaymentRepositoryInterface
{
    public function __construct(Payment $model)
    {
        parent::__construct($model);
    }

    public function findByOrderId(string $orderId): ?Payment
    {
        /** @var Payment|null $payment */
        $payment = $this->model->newQuery()
            ->with(['transactions', 'refunds', 'order.user'])
            ->where('order_id', $orderId)
            ->first();

        return $payment;
    }

    public function findByGatewayPaymentId(string $gateway, string $gatewayPaymentId): ?Payment
    {
        /** @var Payment|null $payment */
        $payment = $this->model->newQuery()
            ->with(['transactions', 'refunds', 'order.user'])
            ->where('gateway', $gateway)
            ->where('gateway_payment_id', $gatewayPaymentId)
            ->first();

        return $payment;
    }

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['order.user', 'transactions', 'refunds'])
            ->orderBy('created_at', 'desc');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['gateway'])) {
            $query->where('gateway', $filters['gateway']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim((string) $filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('gateway_payment_id', 'LIKE', $search)
                    ->orWhereHas('order', function ($oq) use ($search) {
                        $oq->where('order_number', 'LIKE', $search);
                    });
            });
        }

        return $query->paginate($perPage);
    }

    public function createPayment(array $data): Payment
    {
        /** @var Payment $payment */
        $payment = $this->model->newQuery()->create($data);
        return $payment;
    }
}
