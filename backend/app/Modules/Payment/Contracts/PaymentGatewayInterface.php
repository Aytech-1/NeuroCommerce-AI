<?php

declare(strict_types=1);

namespace App\Modules\Payment\Contracts;

use App\Modules\Payment\DTOs\PaymentIntentDTO;
use App\Modules\Payment\DTOs\PaymentResultDTO;
use App\Modules\Payment\DTOs\RefundDTO;
use App\Modules\Payment\DTOs\RefundResultDTO;
use App\Modules\Payment\DTOs\WebhookEventDTO;
use Illuminate\Http\Request;

/**
 * Interface PaymentGatewayInterface
 *
 * Provider-agnostic abstraction for payment gateways.
 *
 * @package App\Modules\Payment\Contracts
 */
interface PaymentGatewayInterface
{
    public function getGatewayName(): string;

    public function chargeOrAuthorize(PaymentIntentDTO $dto): PaymentResultDTO;

    public function capturePayment(string $gatewayPaymentId, ?float $amount = null): PaymentResultDTO;

    public function verifyPayment(string $gatewayPaymentId): PaymentResultDTO;

    public function refundPayment(RefundDTO $dto): RefundResultDTO;

    public function verifyWebhookSignature(Request $request): bool;

    public function parseWebhookEvent(Request $request): WebhookEventDTO;
}
