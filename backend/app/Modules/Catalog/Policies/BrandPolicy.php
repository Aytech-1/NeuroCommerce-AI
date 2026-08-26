<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Brand;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Class BrandPolicy
 *
 * @package App\Modules\Catalog\Policies
 */
class BrandPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool
    {
        return $user?->hasPermissionTo('brand.view') ?? false;
    }

    public function view(?User $user, Brand $brand): bool
    {
        return $user?->hasPermissionTo('brand.view') ?? false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('brand.create');
    }

    public function update(User $user, Brand $brand): bool
    {
        return $user->hasPermissionTo('brand.update');
    }

    public function delete(User $user, Brand $brand): bool
    {
        return $user->hasPermissionTo('brand.delete');
    }
}
