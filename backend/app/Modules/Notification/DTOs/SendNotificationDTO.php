<?php

declare(strict_types=1);

namespace App\Modules\Notification\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;

/**
 * Class SendNotificationDTO
 *
 * @package App\Modules\Notification\DTOs
 */
class SendNotificationDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $userId,
        public readonly string|NotificationType $type,
        public readonly string|NotificationChannel $channel,
        public readonly string $title,
        public readonly ?string $body = null,
        public readonly ?array $data = null,
        public readonly ?string $recipientEmail = null,
        public readonly ?string $recipientPhone = null,
        public readonly ?string $subject = null,
        public readonly bool $isTransactional = false
    ) {
    }
}
