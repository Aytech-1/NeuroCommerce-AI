<?php

declare(strict_types=1);

namespace App\Modules\CMS\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\Banner;

/**
 * Class BannerPolicy
 *
 * @package App\Modules\CMS\Policies
 */
class BannerPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $user->can('cms.view');
    }

    public function view(User $user, Banner $banner): bool
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

    public function update(User $user, Banner $banner): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('cms.update');
    }

    public function delete(User $user, Banner $banner): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('cms.delete');
    }
}
