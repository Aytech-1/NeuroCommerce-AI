<?php

declare(strict_types=1);

namespace App\Modules\Notification\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\Models\Notification;

/**
 * Class NotificationPolicy
 *
 * @package App\Modules\Notification\Policies
 */
class NotificationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Notification $notification): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $notification->user_id === $user->id;
    }

    public function update(User $user, Notification $notification): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $notification->user_id === $user->id;
    }

    public function delete(User $user, Notification $notification): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $notification->user_id === $user->id;
    }
}
