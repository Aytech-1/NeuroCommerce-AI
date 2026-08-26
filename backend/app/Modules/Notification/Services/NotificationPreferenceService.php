<?php

declare(strict_types=1);

namespace App\Modules\Notification\Services;

use App\Core\Abstracts\AbstractService;
use App\Modules\Notification\Contracts\NotificationPreferenceRepositoryInterface;
use App\Modules\Notification\DTOs\UpdateNotificationPreferencesDTO;
use App\Modules\Notification\Enums\NotificationChannel;
use App\Modules\Notification\Enums\NotificationType;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class NotificationPreferenceService
 *
 * @package App\Modules\Notification\Services
 */
class NotificationPreferenceService extends AbstractService
{
    public function __construct(
        protected readonly NotificationPreferenceRepositoryInterface $preferenceRepository
    ) {
    }

    public function getUserPreferences(string $userId): Collection
    {
        return $this->preferenceRepository->getPreferencesByUserId($userId);
    }

    public function isNotificationAllowed(string $userId, string $channel, string $notificationType): bool
    {
        // Transactional notification types (e.g. order confirmation, password reset) are ALWAYS allowed
        $typeEnum = NotificationType::tryFrom($notificationType);
        if ($typeEnum && $typeEnum->isTransactional()) {
            return true;
        }

        return $this->preferenceRepository->isChannelEnabled($userId, $channel, $notificationType);
    }

    public function updatePreferences(string $userId, UpdateNotificationPreferencesDTO $dto): Collection
    {
        $this->preferenceRepository->setBulkPreferences($userId, $dto->preferences);

        return $this->getUserPreferences($userId);
    }
}
