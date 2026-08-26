<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Category;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Class CategoryPolicy
 *
 * @package App\Modules\Catalog\Policies
 */
class CategoryPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool
    {
        return $user?->hasPermissionTo('category.view') ?? false;
    }

    public function view(?User $user, Category $category): bool
    {
        return $user?->hasPermissionTo('category.view') ?? false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('category.create');
    }

    public function update(User $user, Category $category): bool
    {
        return $user->hasPermissionTo('category.update');
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->hasPermissionTo('category.delete');
    }
}
