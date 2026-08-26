<?php

declare(strict_types=1);

namespace App\Modules\Payment\Enums;

/**
 * Enum PaymentStatus
 *
 * Lifecycle states for payments in the Payment bounded context.
 *
 * @package App\Modules\Payment\Enums
 */
enum PaymentStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case CANCELLED = 'cancelled';
    case REFUNDED = 'refunded';
    case PARTIALLY_REFUNDED = 'partially_refunded';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::PROCESSING => 'Processing',
            self::COMPLETED => 'Completed',
            self::FAILED => 'Failed',
            self::CANCELLED => 'Cancelled',
            self::REFUNDED => 'Refunded',
            self::PARTIALLY_REFUNDED => 'Partially Refunded',
        };
    }

    public function isRefundable(): bool
    {
        return in_array($this, [self::COMPLETED, self::PARTIALLY_REFUNDED], true);
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::FAILED, self::CANCELLED, self::REFUNDED], true);
    }
}
