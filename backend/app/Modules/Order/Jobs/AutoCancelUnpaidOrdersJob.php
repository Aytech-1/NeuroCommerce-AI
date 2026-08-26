<?php

declare(strict_types=1);

namespace App\Modules\Order\Jobs;

use App\Modules\Order\Contracts\OrderRepositoryInterface;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Services\OrderStateMachine;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class AutoCancelUnpaidOrdersJob
 *
 * Scans for pending orders exceeding the payment window (e.g. 2 hours) and marks them cancelled.
 *
 * @package App\Modules\Order\Jobs
 */
class AutoCancelUnpaidOrdersJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct()
    {
        $this->onQueue('default');
    }

    public function handle(OrderRepositoryInterface $orderRepository, OrderStateMachine $orderStateMachine): void
    {
        $staleThreshold = now()->subHours(2);

        $staleOrders = Order::query()
            ->where('status', OrderStatus::PENDING->value)
            ->where('created_at', '<=', $staleThreshold)
            ->get();

        foreach ($staleOrders as $order) {
            try {
                $orderStateMachine->transition(
                    $order,
                    OrderStatus::CANCELLED,
                    'Auto-cancelled due to payment timeout (exceeded 2 hours).'
                );
                Log::info("Auto-cancelled stale pending order: {$order->order_number}");
            } catch (\Throwable $e) {
                Log::error("Failed to auto-cancel order {$order->id}: {$e->getMessage()}");
            }
        }
    }
}
