<?php

declare(strict_types=1);

namespace App\Modules\Admin\Enums;

/**
 * Enum CustomerSegment
 *
 * @package App\Modules\Admin\Enums
 */
enum CustomerSegment: string
{
    case NEW = 'new';
    case ACTIVE = 'active';
    case LOYAL = 'loyal';
    case AT_RISK = 'at_risk';
    case CHURNED = 'churned';

    public function label(): string
    {
        return match ($this) {
            self::NEW => 'New Customer',
            self::ACTIVE => 'Active Customer',
            self::LOYAL => 'Loyal Customer',
            self::AT_RISK => 'At Risk Customer',
            self::CHURNED => 'Churned Customer',
        };
    }
}
