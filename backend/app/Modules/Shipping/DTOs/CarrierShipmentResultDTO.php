<?php

declare(strict_types=1);

namespace App\Modules\Shipping\DTOs;

/**
 * Class CarrierShipmentResultDTO
 *
 * @package App\Modules\Shipping\DTOs
 */
class CarrierShipmentResultDTO
{
    public function __construct(
        public readonly bool $isSuccess,
        public readonly ?string $trackingNumber = null,
        public readonly ?string $trackingUrl = null,
        public readonly ?string $labelUrl = null,
        public readonly ?float $cost = null,
        public readonly ?string $errorMessage = null,
        public readonly array $rawResponse = []
    ) {
    }
}
