<?php

declare(strict_types=1);

namespace App\Shared\Enums;

/**
 * Enum PaymentStatus
 *
 * Represents the status of a payment.
 *
 * @package App\Shared\Enums
 * @author NeuroCommerce AI
 * @since 1.0.0
 * @copyright 2026 NeuroCommerce AI
 */
enum PaymentStatus: string
{
    case PENDING = 'pending';
    case AUTHORIZED = 'authorized';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case REFUNDED = 'refunded';
    case PARTIALLY_REFUNDED = 'partially_refunded';
    case CANCELLED = 'cancelled';

    /**
     * Get the human-readable label for the payment status.
     *
     * @return string
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::AUTHORIZED => 'Authorized',
            self::COMPLETED => 'Completed',
            self::FAILED => 'Failed',
            self::REFUNDED => 'Refunded',
            self::PARTIALLY_REFUNDED => 'Partially Refunded',
            self::CANCELLED => 'Cancelled',
        };
    }
}
