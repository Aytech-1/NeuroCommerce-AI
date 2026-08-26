<?php

declare(strict_types=1);

namespace App\Modules\Notification\Repositories;

use App\Modules\Notification\Contracts\NotificationPreferenceRepositoryInterface;
use App\Modules\Notification\Models\NotificationPreference;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class EloquentNotificationPreferenceRepository
 *
 * @package App\Modules\Notification\Repositories
 */
class EloquentNotificationPreferenceRepository implements NotificationPreferenceRepositoryInterface
{
    public function __construct(
        protected readonly NotificationPreference $model
    ) {
    }

    public function getPreferencesByUserId(string $userId): Collection
    {
        return $this->model->newQuery()
            ->where('user_id', $userId)
            ->get();
    }

    public function isChannelEnabled(string $userId, string $channel, string $notificationType): bool
    {
        /** @var NotificationPreference|null $pref */
        $pref = $this->model->newQuery()
            ->where('user_id', $userId)
            ->where('channel', $channel)
            ->where('notification_type', $notificationType)
            ->first();

        // If no preference record exists, default to true (enabled)
        return $pref !== null ? (bool) $pref->is_enabled : true;
    }

    public function setPreference(string $userId, string $channel, string $notificationType, bool $isEnabled): NotificationPreference
    {
        /** @var NotificationPreference */
        return $this->model->newQuery()->updateOrCreate(
            [
                'user_id' => $userId,
                'channel' => $channel,
                'notification_type' => $notificationType,
            ],
            [
                'is_enabled' => $isEnabled,
            ]
        );
    }

    public function setBulkPreferences(string $userId, array $preferences): void
    {
        foreach ($preferences as $pref) {
            $this->setPreference(
                $userId,
                (string) $pref['channel'],
                (string) $pref['notification_type'],
                (bool) $pref['is_enabled']
            );
        }
    }
}
