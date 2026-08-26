<?php

declare(strict_types=1);

namespace App\Modules\Payment\Services;

use App\Core\Exceptions\BusinessRuleException;
use App\Modules\Payment\Contracts\PaymentRepositoryInterface;
use App\Modules\Payment\Contracts\PaymentTransactionRepositoryInterface;
use App\Modules\Payment\DTOs\WebhookEventDTO;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Enums\TransactionStatus;
use App\Modules\Payment\Enums\TransactionType;
use App\Modules\Payment\Events\PaymentCompleted;
use App\Modules\Payment\Events\PaymentFailed;
use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Services\Gateways\PaymentGatewayManager;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Class WebhookService
 *
 * @package App\Modules\Payment\Services
 */
class WebhookService
{
    private const TIMESTAMP_TOLERANCE_SECONDS = 300;
    private const DEDUPLICATION_TTL_DAYS = 7;

    public function __construct(
        private readonly PaymentGatewayManager $gatewayManager,
        private readonly PaymentRepositoryInterface $paymentRepository,
        private readonly PaymentTransactionRepositoryInterface $transactionRepository
    ) {
    }

    public function handleWebhook(string $provider, Request $request): array
    {
        $gateway = $this->gatewayManager->gateway($provider);

        // 1. Signature Verification
        if (!$gateway->verifyWebhookSignature($request)) {
            Log::warning("Webhook signature verification failed for provider: {$provider}", [
                'ip' => $request->ip(),
                'provider' => $provider,
            ]);
            throw new BusinessRuleException(
                'Invalid webhook signature.',
                400,
                'INVALID_WEBHOOK_SIGNATURE'
            );
        }

        // 2. Parse Event DTO
        $event = $gateway->parseWebhookEvent($request);

        // 3. Timestamp Validation (300-second drift tolerance)
        $now = time();
        if ($event->timestamp > 0 && abs($now - $event->timestamp) > self::TIMESTAMP_TOLERANCE_SECONDS) {
            Log::warning("Webhook timestamp expired or out of tolerance for event {$event->eventId}", [
                'event_id' => $event->eventId,
                'event_time' => $event->timestamp,
                'current_time' => $now,
            ]);
            throw new BusinessRuleException(
                'Webhook timestamp expired or outside tolerance window.',
                400,
                'WEBHOOK_TIMESTAMP_EXPIRED'
            );
        }

        // 4. Redis Deduplication Window (7 days)
        $cacheKey = "webhook:processed:{$provider}:{$event->eventId}";
        $isDuplicate = !Cache::add($cacheKey, true, now()->addDays(self::DEDUPLICATION_TTL_DAYS));

        if ($isDuplicate) {
            return [
                'status' => 'duplicate',
                'message' => 'Event already processed.',
                'event_id' => $event->eventId,
            ];
        }

        // 5. Domain Processing
        $this->processEvent($provider, $event);

        return [
            'status' => 'success',
            'message' => 'Webhook processed successfully.',
            'event_id' => $event->eventId,
        ];
    }

    private function processEvent(string $provider, WebhookEventDTO $event): void
    {
        if (!$event->gatewayPaymentId) {
            return;
        }

        /** @var Payment|null $payment */
        $payment = $this->paymentRepository->findByGatewayPaymentId($provider, $event->gatewayPaymentId);
        if (!$payment) {
            return;
        }

        if (str_contains($event->eventType, 'succeeded') || str_contains($event->eventType, 'completed')) {
            if ($payment->status !== PaymentStatus::COMPLETED) {
                $payment->update([
                    'status' => PaymentStatus::COMPLETED,
                    'paid_at' => Carbon::now(),
                ]);

                $this->transactionRepository->recordTransaction([
                    'payment_id' => $payment->id,
                    'type' => TransactionType::CAPTURE->value,
                    'amount' => $event->amount ?? $payment->amount,
                    'currency_code' => $event->currency ?? $payment->currency_code,
                    'gateway_transaction_id' => $event->eventId,
                    'status' => TransactionStatus::SUCCESS->value,
                    'response_data' => $event->payload,
                ]);

                event(new PaymentCompleted($payment));
            }
        } elseif (str_contains($event->eventType, 'failed') || str_contains($event->eventType, 'declined')) {
            if ($payment->status !== PaymentStatus::FAILED) {
                $payment->update([
                    'status' => PaymentStatus::FAILED,
                    'failed_at' => Carbon::now(),
                    'failure_reason' => 'Failed via webhook event: ' . $event->eventType,
                ]);

                $this->transactionRepository->recordTransaction([
                    'payment_id' => $payment->id,
                    'type' => TransactionType::CAPTURE->value,
                    'amount' => $event->amount ?? $payment->amount,
                    'currency_code' => $event->currency ?? $payment->currency_code,
                    'gateway_transaction_id' => $event->eventId,
                    'status' => TransactionStatus::FAILED->value,
                    'response_data' => $event->payload,
                ]);

                event(new PaymentFailed($payment, 'Payment failed at gateway.'));
            }
        }
    }
}
