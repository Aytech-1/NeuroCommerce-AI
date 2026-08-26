<?php

declare(strict_types=1);

namespace App\Modules\Shipping\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class ShippingRateEstimateDTO
 *
 * @package App\Modules\Shipping\DTOs
 */
class ShippingRateEstimateDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $countryCode,
        public readonly float $weight = 1.0,
        public readonly float $orderAmount = 0.0,
        public readonly ?string $postalCode = null,
        public readonly ?string $city = null
    ) {
    }
}
