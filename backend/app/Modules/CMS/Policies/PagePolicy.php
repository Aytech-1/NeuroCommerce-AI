<?php

declare(strict_types=1);

namespace App\Modules\CMS\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\Page;

/**
 * Class PagePolicy
 *
 * @package App\Modules\CMS\Policies
 */
class PagePolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $user->can('cms.view');
    }

    public function view(User $user, Page $page): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $user->can('cms.view');
    }

    public function create(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('cms.create');
    }

    public function update(User $user, Page $page): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('cms.update');
    }

    public function delete(User $user, Page $page): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('cms.delete');
    }

    public function publish(User $user, Page $page): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('cms.update');
    }
}
