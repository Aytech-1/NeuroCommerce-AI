<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Enums;

/**
 * Enum CarrierType
 *
 * @package App\Modules\Shipping\Enums
 */
enum CarrierType: string
{
    case UPS = 'ups';
    case FEDEX = 'fedex';
    case DHL = 'dhl';
    case USPS = 'usps';
    case MOCK = 'mock_carrier';

    public function label(): string
    {
        return match ($this) {
            self::UPS => 'UPS',
            self::FEDEX => 'FedEx',
            self::DHL => 'DHL',
            self::USPS => 'USPS',
            self::MOCK => 'Mock Carrier',
        };
    }
}
