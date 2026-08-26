<?php

declare(strict_types=1);

namespace App\Modules\Notification\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;

/**
 * Class CreateNotificationTemplateDTO
 *
 * @package App\Modules\Notification\DTOs
 */
class CreateNotificationTemplateDTO extends AbstractDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string|NotificationChannel $channel,
        public readonly string|NotificationType $notificationType,
        public readonly string $bodyTemplate,
        public readonly ?string $subject = null,
        public readonly ?array $variables = null,
        public readonly bool $isActive = true
    ) {
    }
}
