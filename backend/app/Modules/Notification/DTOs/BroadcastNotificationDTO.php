<?php

declare(strict_types=1);

namespace App\Modules\Notification\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Modules\Notification\Enums\NotificationChannel;

/**
 * Class BroadcastNotificationDTO
 *
 * @package App\Modules\Notification\DTOs
 */
class BroadcastNotificationDTO extends AbstractDTO
{
    /**
     * @param array<int, string>|null $targetUserIds null for all users
     */
    public function __construct(
        public readonly string $title,
        public readonly string $body,
        public readonly string|NotificationChannel $channel = NotificationChannel::DATABASE,
        public readonly ?array $targetUserIds = null,
        public readonly ?array $data = null
    ) {
    }
}
