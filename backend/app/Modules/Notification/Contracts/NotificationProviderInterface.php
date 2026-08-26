<?php

declare(strict_types=1);

namespace App\Modules\Notification\Contracts;

use App\Modules\Notification\DTOs\SendNotificationDTO;
use App\Modules\Notification\Enums\NotificationChannel;

/**
 * Interface NotificationProviderInterface
 *
 * @package App\Modules\Notification\Contracts
 */
interface NotificationProviderInterface
{
    public function getChannel(): NotificationChannel;

    public function send(SendNotificationDTO $dto): bool;
}
