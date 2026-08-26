<?php

declare(strict_types=1);

namespace App\Modules\Admin\Policies;

use App\Modules\Auth\Models\User;

/**
 * Class AnalyticsPolicy
 *
 * @package App\Modules\Admin\Policies
 */
class AnalyticsPolicy
{
    public function view(User $user): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $user->can('analytics.view');
    }

    public function generate(User $user): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $user->can('reports.generate') || $user->can('analytics.view');
    }
}
