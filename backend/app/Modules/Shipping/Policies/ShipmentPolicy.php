<?php

declare(strict_types=1);

namespace App\Modules\Shipping\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Shipping\Models\Shipment;

/**
 * Class ShipmentPolicy
 *
 * @package App\Modules\Shipping\Policies
 */
class ShipmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('shipping.view');
    }

    public function view(User $user, Shipment $shipment): bool
    {
        if ($user->can('shipping.view')) {
            return true;
        }

        return (string) $shipment->order?->user_id === (string) $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can('shipping.create');
    }

    public function update(User $user, Shipment $shipment): bool
    {
        return $user->can('shipping.update');
    }
}
