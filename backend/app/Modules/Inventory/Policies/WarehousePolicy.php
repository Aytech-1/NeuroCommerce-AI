<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Inventory\Models\Warehouse;

/**
 * Class WarehousePolicy
 *
 * @package App\Modules\Inventory\Policies
 */
class WarehousePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('warehouse.view') || $user->hasPermissionTo('inventory.view');
    }

    public function view(User $user, Warehouse $warehouse): bool
    {
        return $user->hasPermissionTo('warehouse.view') || $user->hasPermissionTo('inventory.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('warehouse.create');
    }

    public function update(User $user, Warehouse $warehouse): bool
    {
        return $user->hasPermissionTo('warehouse.update');
    }

    public function delete(User $user, Warehouse $warehouse): bool
    {
        return $user->hasPermissionTo('warehouse.delete');
    }
}
