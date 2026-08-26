<?php

declare(strict_types=1);

namespace App\Modules\Notification\Contracts;

use App\Modules\Notification\Models\NotificationPreference;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface NotificationPreferenceRepositoryInterface
 *
 * @package App\Modules\Notification\Contracts
 */
interface NotificationPreferenceRepositoryInterface
{
    public function getPreferencesByUserId(string $userId): Collection;

    public function isChannelEnabled(string $userId, string $channel, string $notificationType): bool;

    public function setPreference(string $userId, string $channel, string $notificationType, bool $isEnabled): NotificationPreference;

    public function setBulkPreferences(string $userId, array $preferences): void;
}
