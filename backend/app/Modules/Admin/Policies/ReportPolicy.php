<?php

declare(strict_types=1);

namespace App\Modules\Admin\Policies;

use App\Modules\Auth\Models\User;

/**
 * Class ReportPolicy
 *
 * @package App\Modules\Admin\Policies
 */
class ReportPolicy
{
    public function view(User $user): bool
    {
        if ($user->isAdmin() || $user->isStaff()) {
            return true;
        }

        return $user->can('reports.view');
    }

    public function generate(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->can('reports.generate');
    }
}
