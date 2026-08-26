<?php

declare(strict_types=1);

namespace App\Modules\Notification\DTOs;

use App\Core\Abstracts\AbstractDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;

/**
 * Class UpdateNotificationTemplateDTO
 *
 * @package App\Modules\Notification\DTOs
 */
class UpdateNotificationTemplateDTO extends AbstractDTO
{
    public function __construct(
        public readonly ?string $name = null,
        public readonly null|string|NotificationChannel $channel = null,
        public readonly null|string|NotificationType $notificationType = null,
        public readonly ?string $bodyTemplate = null,
        public readonly ?string $subject = null,
        public readonly ?array $variables = null,
        public readonly ?bool $isActive = null
    ) {
    }
}
