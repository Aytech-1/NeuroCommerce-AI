<?php

declare(strict_types=1);

namespace App\Modules\Payment\Services\Gateways;

use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\DTOs\PaymentIntentDTO;
use App\Modules\Payment\DTOs\PaymentResultDTO;
use App\Modules\Payment\DTOs\RefundDTO;
use App\Modules\Payment\DTOs\RefundResultDTO;
use App\Modules\Payment\DTOs\WebhookEventDTO;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Class MockPaymentGateway
 *
 * Deterministic test adapter for headless CI and local automated testing.
 *
 * @package App\Modules\Payment\Services\Gateways
 */
class MockPaymentGateway implements PaymentGatewayInterface
{
    public function getGatewayName(): string
    {
        return 'mock_stripe';
    }

    public function chargeOrAuthorize(PaymentIntentDTO $dto): PaymentResultDTO
    {
        if ($dto->paymentToken === 'tok_fail' || $dto->paymentToken === 'tok_charge_declined') {
            return new PaymentResultDTO(
                isSuccess: false,
                errorMessage: 'Your card was declined.',
                rawResponse: ['decline_code' => 'card_declined', 'status' => 'failed']
            );
        }

        $transId = 'mock_tx_' . Str::random(16);
        $payId = 'mock_pi_' . Str::random(16);

        return new PaymentResultDTO(
            isSuccess: true,
            transactionId: $transId,
            gatewayPaymentId: $payId,
            cardLastFour: '4242',
            cardBrand: 'visa',
            rawResponse: [
                'id' => $payId,
                'status' => 'succeeded',
                'amount' => (int) round($dto->amount * 100),
                'currency' => strtolower($dto->currency),
            ]
        );
    }

    public function capturePayment(string $gatewayPaymentId, ?float $amount = null): PaymentResultDTO
    {
        return new PaymentResultDTO(
            isSuccess: true,
            transactionId: 'mock_tx_' . Str::random(16),
            gatewayPaymentId: $gatewayPaymentId,
            cardLastFour: '4242',
            cardBrand: 'visa',
            rawResponse: ['id' => $gatewayPaymentId, 'status' => 'captured']
        );
    }

    public function verifyPayment(string $gatewayPaymentId): PaymentResultDTO
    {
        if (str_contains($gatewayPaymentId, 'fail')) {
            return new PaymentResultDTO(
                isSuccess: false,
                errorMessage: 'Payment verification failed at gateway.',
                rawResponse: ['status' => 'failed']
            );
        }

        return new PaymentResultDTO(
            isSuccess: true,
            transactionId: 'mock_tx_' . Str::random(16),
            gatewayPaymentId: $gatewayPaymentId,
            cardLastFour: '4242',
            cardBrand: 'visa',
            rawResponse: ['id' => $gatewayPaymentId, 'status' => 'succeeded']
        );
    }

    public function refundPayment(RefundDTO $dto): RefundResultDTO
    {
        if ($dto->amount <= 0) {
            return new RefundResultDTO(
                isSuccess: false,
                errorMessage: 'Refund amount must be greater than zero.'
            );
        }

        $refundId = 'mock_ref_' . Str::random(16);

        return new RefundResultDTO(
            isSuccess: true,
            gatewayRefundId: $refundId,
            rawResponse: [
                'id' => $refundId,
                'status' => 'succeeded',
                'amount' => (int) round($dto->amount * 100),
                'payment' => $dto->payment->gateway_payment_id,
            ]
        );
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $signature = $request->header('X-Webhook-Signature') ?? $request->header('Stripe-Signature');
        if (empty($signature)) {
            return false;
        }

        $payload = $request->getContent();
        $secret = config('payment.gateways.mock.webhook_secret', 'mock_secret_key');

        $computedSignature = hash_hmac('sha256', $payload, $secret);

        return hash_equals($computedSignature, (string) $signature);
    }

    public function parseWebhookEvent(Request $request): WebhookEventDTO
    {
        $payload = json_decode($request->getContent(), true) ?? [];

        return new WebhookEventDTO(
            eventId: (string) ($payload['id'] ?? ('evt_' . Str::random(16))),
            eventType: (string) ($payload['type'] ?? 'payment_intent.succeeded'),
            gateway: 'mock_stripe',
            gatewayPaymentId: $payload['data']['object']['id'] ?? $payload['gateway_payment_id'] ?? null,
            orderId: $payload['data']['object']['metadata']['order_id'] ?? $payload['order_id'] ?? null,
            amount: isset($payload['data']['object']['amount']) ? ((float) $payload['data']['object']['amount']) / 100 : (isset($payload['amount']) ? (float) $payload['amount'] : null),
            currency: $payload['data']['object']['currency'] ?? $payload['currency'] ?? 'USD',
            payload: $payload,
            timestamp: (int) ($payload['created'] ?? time())
        );
    }
}
