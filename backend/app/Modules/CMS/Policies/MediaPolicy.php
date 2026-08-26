<?php

declare(strict_types=1);

namespace App\Modules\CMS\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\CMS\Models\MediaFile;

/**
 * Class MediaPolicy
 *
 * @package App\Modules\CMS\Policies
 */
class MediaPolicy
{
    public function viewAny(User $user): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $user->can('cms.view');
    }

    public function view(User $user, MediaFile $mediaFile): bool
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

    public function delete(User $user, MediaFile $mediaFile): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('cms.delete');
    }
}
