<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Enums;

/**
 * Enum ShipmentStatus
 *
 * @package App\Modules\Shipping\Enums
 */
enum ShipmentStatus: string
{
    case PENDING = 'pending';
    case LABEL_CREATED = 'label_created';
    case PICKED_UP = 'picked_up';
    case IN_TRANSIT = 'in_transit';
    case OUT_FOR_DELIVERY = 'out_for_delivery';
    case DELIVERED = 'delivered';
    case FAILED = 'failed';
    case RETURNED = 'returned';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::LABEL_CREATED => 'Label Created',
            self::PICKED_UP => 'Picked Up',
            self::IN_TRANSIT => 'In Transit',
            self::OUT_FOR_DELIVERY => 'Out for Delivery',
            self::DELIVERED => 'Delivered',
            self::FAILED => 'Failed',
            self::RETURNED => 'Returned',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::DELIVERED, self::RETURNED], true);
    }
}
