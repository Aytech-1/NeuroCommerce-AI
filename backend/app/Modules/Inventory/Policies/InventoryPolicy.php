<?php

declare(strict_types=1);

namespace App\Modules\Inventory\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Inventory\Models\InventoryItem;

/**
 * Class InventoryPolicy
 *
 * @package App\Modules\Inventory\Policies
 */
class InventoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('inventory.view');
    }

    public function view(User $user, ?InventoryItem $item = null): bool
    {
        return $user->hasPermissionTo('inventory.view');
    }

    public function adjust(User $user): bool
    {
        return $user->hasPermissionTo('inventory.adjust') || $user->hasPermissionTo('inventory.update');
    }

    public function transfer(User $user): bool
    {
        return $user->hasPermissionTo('inventory.adjust') || $user->hasPermissionTo('inventory.update');
    }
}
