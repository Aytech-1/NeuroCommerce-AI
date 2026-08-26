<?php

declare(strict_types=1);

namespace App\Modules\Admin\Enums;

/**
 * Enum KpiPeriodType
 *
 * @package App\Modules\Admin\Enums
 */
enum KpiPeriodType: string
{
    case REALTIME = 'realtime';
    case HOURLY = 'hourly';
    case DAILY = 'daily';
    case WEEKLY = 'weekly';
    case MONTHLY = 'monthly';
}
