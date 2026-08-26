<?php

declare(strict_types=1);

namespace App\Modules\Payment\Jobs;

use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Services\PaymentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Class ReconcilePendingPaymentsJob
 *
 * Scans for stale pending payments and verifies their current status with gateways.
 *
 * @package App\Modules\Payment\Jobs
 */
class ReconcilePendingPaymentsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly int $thresholdMinutes = 30
    ) {
        $this->onQueue('payments');
    }

    public function handle(PaymentService $paymentService): void
    {
        $cutoff = Carbon::now()->subMinutes($this->thresholdMinutes);

        $pendingPayments = Payment::query()
            ->whereIn('status', [PaymentStatus::PENDING->value, PaymentStatus::PROCESSING->value])
            ->whereNotNull('gateway_payment_id')
            ->where('created_at', '<=', $cutoff)
            ->limit(100)
            ->get();

        foreach ($pendingPayments as $payment) {
            try {
                $paymentService->verifyPayment($payment->gateway, (string) $payment->gateway_payment_id);
            } catch (\Throwable $e) {
                Log::warning("Failed to reconcile payment {$payment->id}: " . $e->getMessage());
            }
        }
    }
}
