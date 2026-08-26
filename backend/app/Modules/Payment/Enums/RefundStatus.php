<?php

declare(strict_types=1);

namespace App\Modules\Payment\Enums;

/**
 * Enum RefundStatus
 *
 * @package App\Modules\Payment\Enums
 */
enum RefundStatus: string
{
    case PENDING = 'pending';
    case APPROVED = 'approved';
    case PROCESSED = 'processed';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::APPROVED => 'Approved',
            self::PROCESSED => 'Processed',
            self::REJECTED => 'Rejected',
        };
    }
}
