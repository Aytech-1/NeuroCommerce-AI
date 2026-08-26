<?php

declare(strict_types=1);

namespace App\Modules\Payment\DTOs;

/**
 * Class RefundResultDTO
 *
 * @package App\Modules\Payment\DTOs
 */
class RefundResultDTO
{
    public function __construct(
        public readonly bool $isSuccess,
        public readonly ?string $gatewayRefundId = null,
        public readonly ?string $errorMessage = null,
        public readonly array $rawResponse = []
    ) {
    }
}
