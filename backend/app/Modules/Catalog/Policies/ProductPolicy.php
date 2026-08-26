<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Class ProductPolicy
 *
 * @package App\Modules\Catalog\Policies
 */
class ProductPolicy
{
    use HandlesAuthorization;

    public function viewAny(?User $user): bool
    {
        return $user?->hasPermissionTo('product.view') ?? false;
    }

    public function view(?User $user, Product $product): bool
    {
        return $user?->hasPermissionTo('product.view') ?? false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('product.create');
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasPermissionTo('product.update');
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasPermissionTo('product.delete');
    }

    public function restore(User $user, Product $product): bool
    {
        return $user->hasPermissionTo('product.delete');
    }
}
