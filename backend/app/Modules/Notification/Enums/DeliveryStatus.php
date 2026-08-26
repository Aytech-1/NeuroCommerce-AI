<?php

declare(strict_types=1);

namespace App\Modules\Notification\Enums;

/**
 * Enum DeliveryStatus
 *
 * @package App\Modules\Notification\Enums
 */
enum DeliveryStatus: string
{
    case PENDING = 'pending';
    case SENT = 'sent';
    case FAILED = 'failed';
    case READ = 'read';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Pending',
            self::SENT => 'Sent',
            self::FAILED => 'Failed',
            self::READ => 'Read',
        };
    }
}
