<?php

declare(strict_types=1);

namespace App\Modules\Notification\Enums;

/**
 * Enum NotificationType
 *
 * @package App\Modules\Notification\Enums
 */
enum NotificationType: string
{
    case ORDER_CONFIRMATION = 'order_confirmation';
    case ORDER_SHIPPED = 'order_shipped';
    case ORDER_DELIVERED = 'order_delivered';
    case ORDER_CANCELLED = 'order_cancelled';
    case PAYMENT_RECEIVED = 'payment_received';
    case USER_REGISTERED = 'user_registered';
    case PASSWORD_RESET = 'password_reset';
    case STOCK_LOW = 'stock_low';
    case REVIEW_APPROVED = 'review_approved';
    case ABANDONED_CART = 'abandoned_cart';
    case SYSTEM_BROADCAST = 'system_broadcast';

    public function isTransactional(): bool
    {
        return match ($this) {
            self::ORDER_CONFIRMATION,
            self::ORDER_SHIPPED,
            self::ORDER_DELIVERED,
            self::ORDER_CANCELLED,
            self::PAYMENT_RECEIVED,
            self::USER_REGISTERED,
            self::PASSWORD_RESET => true,
            default => false,
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::ORDER_CONFIRMATION => 'Order Confirmation',
            self::ORDER_SHIPPED => 'Order Shipped',
            self::ORDER_DELIVERED => 'Order Delivered',
            self::ORDER_CANCELLED => 'Order Cancelled',
            self::PAYMENT_RECEIVED => 'Payment Received',
            self::USER_REGISTERED => 'User Registration Welcome',
            self::PASSWORD_RESET => 'Password Reset',
            self::STOCK_LOW => 'Low Stock Warning',
            self::REVIEW_APPROVED => 'Review Approval',
            self::ABANDONED_CART => 'Abandoned Cart Reminder',
            self::SYSTEM_BROADCAST => 'System Announcement',
        };
    }
}
