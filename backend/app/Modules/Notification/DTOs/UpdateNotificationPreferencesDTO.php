<?php

declare(strict_types=1);

namespace App\Modules\Notification\DTOs;

use App\Core\Abstracts\AbstractDTO;

/**
 * Class UpdateNotificationPreferencesDTO
 *
 * @package App\Modules\Notification\DTOs
 */
class UpdateNotificationPreferencesDTO extends AbstractDTO
{
    /**
     * @param array<int, array{channel: string, notification_type: string, is_enabled: bool}> $preferences
     */
    public function __construct(
        public readonly array $preferences
    ) {
    }
}
