<?php

declare(strict_types=1);

namespace App\Modules\Notification\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Notification\Models\NotificationTemplate;

/**
 * Class NotificationTemplatePolicy
 *
 * @package App\Modules\Notification\Policies
 */
class NotificationTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $user->can('notification.view');
    }

    public function view(User $user, NotificationTemplate $template): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $user->can('notification.view');
    }

    public function create(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('notification.create');
    }

    public function update(User $user, NotificationTemplate $template): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('notification.update');
    }

    public function delete(User $user, NotificationTemplate $template): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('notification.delete');
    }

    public function broadcast(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('notification.send');
    }
}
