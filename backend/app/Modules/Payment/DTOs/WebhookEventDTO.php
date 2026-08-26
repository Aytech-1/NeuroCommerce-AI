<?php

declare(strict_types=1);

namespace App\Modules\Payment\DTOs;

/**
 * Class WebhookEventDTO
 *
 * @package App\Modules\Payment\DTOs
 */
class WebhookEventDTO
{
    public function __construct(
        public readonly string $eventId,
        public readonly string $eventType,
        public readonly string $gateway,
        public readonly ?string $gatewayPaymentId,
        public readonly ?string $orderId,
        public readonly ?float $amount,
        public readonly ?string $currency,
        public readonly array $payload,
        public readonly int $timestamp
    ) {
    }
}
