<?php

declare(strict_types=1);

namespace App\Modules\Notification\Enums;

/**
 * Enum NotificationChannel
 *
 * @package App\Modules\Notification\Enums
 */
enum NotificationChannel: string
{
    case EMAIL = 'email';
    case SMS = 'sms';
    case PUSH = 'push';
    case DATABASE = 'database';

    public function label(): string
    {
        return match ($this) {
            self::EMAIL => 'Email',
            self::SMS => 'SMS',
            self::PUSH => 'Push Notification',
            self::DATABASE => 'In-App Notification',
        };
    }
}
