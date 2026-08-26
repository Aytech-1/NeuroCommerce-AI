<?php

declare(strict_types=1);

namespace App\Modules\Order\DTOs;

/**
 * Class PaymentResultDTO
 *
 * @package App\Modules\Order\DTOs
 */
class PaymentResultDTO
{
    public function __construct(
        public readonly bool $isSuccess,
        public readonly ?string $transactionId = null,
        public readonly ?string $errorMessage = null,
        public readonly array $rawResponse = []
    ) {
    }
}
