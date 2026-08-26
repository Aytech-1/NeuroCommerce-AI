<?php

declare(strict_types=1);

namespace App\Modules\Order\Enums;

/**
 * Enum OrderStatus
 *
 * Authoritative lifecycle states for an Order aggregate.
 *
 * @package App\Modules\Order\Enums
 */
enum OrderStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case PAID = 'paid';
    case SHIPPED = 'shipped';
    case DELIVERED = 'delivered';
    case CANCELLED = 'cancelled';
    case REFUNDED = 'refunded';
    case ON_HOLD = 'on_hold';

    /**
     * Get human-readable label.
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::PROCESSING => 'Processing',
            self::PAID => 'Paid',
            self::SHIPPED => 'Shipped',
            self::DELIVERED => 'Delivered',
            self::CANCELLED => 'Cancelled',
            self::REFUNDED => 'Refunded',
            self::ON_HOLD => 'On Hold',
        };
    }

    /**
     * Determine if customer can cancel the order.
     */
    public function isCancellable(): bool
    {
        return in_array($this, [self::PENDING, self::ON_HOLD], true);
    }

    /**
     * Determine if the status represents a terminal state.
     */
    public function isTerminal(): bool
    {
        return in_array($this, [self::DELIVERED, self::CANCELLED, self::REFUNDED], true);
    }

    /**
     * Determine if a state transition is legally permissible.
     */
    public function canTransitionTo(self $target): bool
    {
        if ($this === $target) {
            return true;
        }

        return match ($this) {
            self::PENDING => in_array($target, [self::PAID, self::PROCESSING, self::CANCELLED, self::ON_HOLD], true),
            self::PAID => in_array($target, [self::PROCESSING, self::SHIPPED, self::REFUNDED, self::CANCELLED, self::ON_HOLD], true),
            self::PROCESSING => in_array($target, [self::SHIPPED, self::ON_HOLD, self::CANCELLED, self::REFUNDED], true),
            self::ON_HOLD => in_array($target, [self::PENDING, self::PAID, self::PROCESSING, self::CANCELLED], true),
            self::SHIPPED => in_array($target, [self::DELIVERED, self::REFUNDED], true),
            self::DELIVERED => $target === self::REFUNDED,
            self::CANCELLED, self::REFUNDED => false,
        };
    }
}
