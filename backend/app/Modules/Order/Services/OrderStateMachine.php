<?php

declare(strict_types=1);

namespace App\Modules\Order\Services;

use App\Core\Exceptions\BusinessRuleException;
use App\Modules\Auth\Models\User;
use App\Modules\Inventory\Services\InventoryService;
use App\Modules\Order\Contracts\OrderRepositoryInterface;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Events\OrderCancelled;
use App\Modules\Order\Events\OrderPaid;
use App\Modules\Order\Events\OrderStatusChanged;
use App\Modules\Order\Models\Order;
use Illuminate\Support\Facades\DB;

/**
 * Class OrderStateMachine
 *
 * Enforces legal state transitions on Order aggregates, persists historical audit trail,
 * and executes compensating actions (such as stock release on cancellation).
 *
 * @package App\Modules\Order\Services
 */
class OrderStateMachine
{
    public function __construct(
        protected OrderRepositoryInterface $orderRepository,
        protected InventoryService $inventoryService
    ) {
    }

    /**
     * Transition an order to a new status.
     *
     * @param Order $order
     * @param OrderStatus $targetStatus
     * @param string|null $comment
     * @param User|null $actor
     * @return Order
     * @throws BusinessRuleException
     */
    public function transition(Order $order, OrderStatus $targetStatus, ?string $comment = null, ?User $actor = null): Order
    {
        $currentStatus = $order->status;

        if ($currentStatus === $targetStatus) {
            return $order;
        }

        if (! $currentStatus->canTransitionTo($targetStatus)) {
            throw new BusinessRuleException(
                "Illegal order state transition from '{$currentStatus->value}' to '{$targetStatus->value}'."
            );
        }

        return DB::transaction(function () use ($order, $currentStatus, $targetStatus, $comment, $actor) {
            $updates = [
                'status' => $targetStatus,
            ];

            // Set milestone timestamps
            if ($targetStatus === OrderStatus::PAID && ! $order->paid_at) {
                $updates['paid_at'] = now();
            } elseif ($targetStatus === OrderStatus::SHIPPED && ! $order->shipped_at) {
                $updates['shipped_at'] = now();
            } elseif ($targetStatus === OrderStatus::DELIVERED && ! $order->delivered_at) {
                $updates['delivered_at'] = now();
            } elseif ($targetStatus === OrderStatus::CANCELLED && ! $order->cancelled_at) {
                $updates['cancelled_at'] = now();
            }

            $order->update($updates);

            // Log historical audit entry
            $this->orderRepository->addStatusHistory(
                orderId: $order->id,
                fromStatus: $currentStatus->value,
                toStatus: $targetStatus->value,
                comment: $comment,
                changedBy: $actor?->id
            );

            // Dispatch domain events
            event(new OrderStatusChanged($order, $currentStatus, $targetStatus));

            if ($targetStatus === OrderStatus::PAID) {
                event(new OrderPaid($order));
            } elseif ($targetStatus === OrderStatus::CANCELLED) {
                event(new OrderCancelled($order, $comment));
            }

            return $order->fresh(['items.product', 'items.variant', 'statusHistory']);
        });
    }
}
