<?php

declare(strict_types=1);

namespace App\Modules\Order\Contracts;

use App\Core\Contracts\BaseRepositoryInterface;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderStatusHistory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Interface OrderRepositoryInterface
 *
 * Contract for querying and mutating Order aggregates and status histories.
 *
 * @package App\Modules\Order\Contracts
 */
interface OrderRepositoryInterface extends BaseRepositoryInterface
{
    public function findById(string $id, array $relations = ['items.product', 'items.variant', 'billingAddress', 'shippingAddress', 'statusHistory.changer']): ?Order;

    public function findByOrderNumber(string $orderNumber, array $relations = ['items.product', 'items.variant', 'billingAddress', 'shippingAddress']): ?Order;

    public function paginateForUser(string $userId, array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function paginateForAdmin(array $filters = [], int $perPage = 20): LengthAwarePaginator;

    public function addStatusHistory(string $orderId, ?string $fromStatus, string $toStatus, ?string $comment = null, ?string $changedBy = null): OrderStatusHistory;

    public function generateOrderNumber(): string;
}
