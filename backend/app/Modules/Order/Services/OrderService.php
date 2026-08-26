<?php

declare(strict_types=1);

namespace App\Modules\Order\Services;

use App\Core\Abstracts\AbstractService;
use App\Core\Exceptions\AuthorizationException;
use App\Core\Exceptions\BusinessRuleException;
use App\Core\Exceptions\EntityNotFoundException;
use App\Modules\Auth\Models\User;
use App\Modules\Order\Contracts\InvoiceRepositoryInterface;
use App\Modules\Order\Contracts\OrderRepositoryInterface;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Invoice;
use App\Modules\Order\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class OrderService
 *
 * Core domain service for managing order retrieval, customer history, cancellations,
 * admin status updates, staff notes, and invoice lookups.
 *
 * @package App\Modules\Order\Services
 */
class OrderService extends AbstractService
{
    public function __construct(
        protected OrderRepositoryInterface $orderRepository,
        protected InvoiceRepositoryInterface $invoiceRepository,
        protected OrderStateMachine $orderStateMachine
    ) {
    }

    public function getCustomerOrders(string $userId, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->orderRepository->paginateForUser($userId, $filters, $perPage);
    }

    public function getOrderById(string $orderId, ?string $userId = null): Order
    {
        $order = $this->orderRepository->findById($orderId);

        if (! $order) {
            throw new EntityNotFoundException('Order', $orderId);
        }

        // IDOR Verification
        if ($userId !== null && $order->user_id !== $userId) {
            throw new AuthorizationException('You are not authorized to view this order.');
        }

        return $order;
    }

    public function cancelOrder(string $orderId, ?string $userId = null, ?string $reason = null): Order
    {
        $order = $this->getOrderById($orderId, $userId);

        if (! $order->status->isCancellable()) {
            throw new BusinessRuleException(
                "Orders with status '{$order->status->value}' cannot be cancelled."
            );
        }

        return $this->orderStateMachine->transition(
            $order,
            OrderStatus::CANCELLED,
            $reason ?: 'Cancelled by customer'
        );
    }

    public function getAdminOrders(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->orderRepository->paginateForAdmin($filters, $perPage);
    }

    public function updateOrderStatus(string $orderId, string $status, ?string $comment = null, ?User $actor = null): Order
    {
        $order = $this->orderRepository->findById($orderId);

        if (! $order) {
            throw new EntityNotFoundException('Order', $orderId);
        }

        $targetStatus = OrderStatus::tryFrom($status);
        if (! $targetStatus) {
            throw new BusinessRuleException("Invalid order status: '{$status}'.");
        }

        return $this->orderStateMachine->transition($order, $targetStatus, $comment, $actor);
    }

    public function addAdminNote(string $orderId, string $notes): Order
    {
        $order = $this->orderRepository->findById($orderId);

        if (! $order) {
            throw new EntityNotFoundException('Order', $orderId);
        }

        $order->admin_notes = $notes;
        $order->save();

        return $order;
    }

    public function getOrderTimeline(string $orderId): Collection
    {
        $order = $this->orderRepository->findById($orderId);

        if (! $order) {
            throw new EntityNotFoundException('Order', $orderId);
        }

        return $order->statusHistory;
    }

    public function getInvoice(string $orderId, ?string $userId = null): Invoice
    {
        $order = $this->getOrderById($orderId, $userId);

        $invoice = $this->invoiceRepository->findByOrderId($order->id);

        if (! $invoice) {
            throw new EntityNotFoundException('Invoice', $orderId);
        }

        return $invoice;
    }
}
