<?php

declare(strict_types=1);

namespace App\Modules\Auth\Policies;

use App\Modules\Auth\Models\Address;
use App\Modules\Auth\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Class AddressPolicy
 *
 * @package App\Modules\Auth\Policies
 */
class AddressPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     *
     * @param User $user
     * @return bool
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     *
     * @param User $user
     * @param Address $address
     * @return bool
     */
    public function view(User $user, Address $address): bool
    {
        return $address->addressable_id === $user->id || $user->can('user.view');
    }

    /**
     * Determine whether the user can create models.
     *
     * @param User $user
     * @return bool
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     *
     * @param User $user
     * @param Address $address
     * @return bool
     */
    public function update(User $user, Address $address): bool
    {
        return $address->addressable_id === $user->id || $user->can('user.update');
    }

    /**
     * Determine whether the user can delete the model.
     *
     * @param User $user
     * @param Address $address
     * @return bool
     */
    public function delete(User $user, Address $address): bool
    {
        return $address->addressable_id === $user->id || $user->can('user.delete');
    }
}
