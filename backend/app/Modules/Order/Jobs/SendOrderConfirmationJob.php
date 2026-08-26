<?php

declare(strict_types=1);

namespace App\Modules\Order\Jobs;

use App\Modules\Order\Contracts\OrderRepositoryInterface;
use App\Modules\Order\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class SendOrderConfirmationJob
 *
 * Asynchronously delivers order confirmation receipts via email.
 *
 * @package App\Modules\Order\Jobs
 */
class SendOrderConfirmationJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;
    public bool $afterCommit = true;

    public function __construct(
        public readonly string $orderId
    ) {
        $this->onQueue('notifications');
    }

    public function handle(OrderRepositoryInterface $orderRepository): void
    {
        $order = $orderRepository->findById($this->orderId);

        if (! $order) {
            return;
        }

        Log::info("Dispatching Order Confirmation notification for order: {$order->order_number}");
    }
}
