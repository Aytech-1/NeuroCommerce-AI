<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Shipping\Models\ShipRate;
use App\Modules\Shipping\Models\ShipZone;

/**
 * Class ShippingZonePolicy
 *
 * @package App\Modules\Shipping\Policies
 */
class ShippingZonePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('shipping.view');
    }

    public function view(User $user, ShipZone|ShipRate $zone): bool
    {
        return $user->can('shipping.view');
    }

    public function create(User $user): bool
    {
        return $user->can('shipping.create');
    }

    public function update(User $user, ShipZone|ShipRate $zone): bool
    {
        return $user->can('shipping.update');
    }
}
