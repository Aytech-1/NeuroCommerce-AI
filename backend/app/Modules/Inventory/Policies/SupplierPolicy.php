<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Inventory\Models\Supplier;

/**
 * Class SupplierPolicy
 *
 * @package App\Modules\Inventory\Policies
 */
class SupplierPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('supplier.view') || $user->hasPermissionTo('inventory.view');
    }

    public function view(User $user, Supplier $supplier): bool
    {
        return $user->hasPermissionTo('supplier.view') || $user->hasPermissionTo('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('supplier.create');
    }

    public function update(User $user, Supplier $supplier): bool
    {
        return $user->hasPermissionTo('supplier.update');
    }

    public function delete(User $user, Supplier $supplier): bool
    {
        return $user->hasPermissionTo('supplier.delete');
    }
}
