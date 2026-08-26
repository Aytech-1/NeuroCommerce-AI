<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\ProductAttribute;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Class AttributePolicy
 *
 * @package App\Modules\Catalog\Policies
 */
class AttributePolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool
    {
        return $user?->hasPermissionTo('attribute.view') ?? false;
    }

    public function view(?User $user, ProductAttribute $attribute): bool
    {
        return $user?->hasPermissionTo('attribute.view') ?? false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('attribute.create');
    }

    public function update(User $user, ProductAttribute $attribute): bool
    {
        return $user->hasPermissionTo('attribute.update');
    }

    public function delete(User $user, ProductAttribute $attribute): bool
    {
        return $user->hasPermissionTo('attribute.delete');
    }
}
