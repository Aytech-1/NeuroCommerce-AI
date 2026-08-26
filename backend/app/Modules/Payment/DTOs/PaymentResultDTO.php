<?php

declare(strict_types=1);

namespace App\Modules\Payment\DTOs;

/**
 * Class PaymentResultDTO
 *
 * @package App\Modules\Payment\DTOs
 */
class PaymentResultDTO
{
    public function __construct(
        public readonly bool $isSuccess,
        public readonly ?string $transactionId = null,
        public readonly ?string $gatewayPaymentId = null,
        public readonly ?string $cardLastFour = null,
        public readonly ?string $cardBrand = null,
        public readonly ?string $errorMessage = null,
        public readonly array $rawResponse = []
    ) {
    }
}
