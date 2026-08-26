<?php

declare(strict_types=1);

namespace App\Modules\Cart\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Cart\Models\Cart;

/**
 * Cart Authorization Policy
 */
class CartPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        return null;
    }

    public function view(User $user, Cart $cart): bool
    {
        return $cart->user_id === $user->id || $user->hasRole('admin');
    }

    public function update(User $user, Cart $cart): bool
    {
        return $cart->user_id === $user->id || $user->hasRole('admin');
    }

    public function delete(User $user, Cart $cart): bool
    {
        return $cart->user_id === $user->id || $user->hasRole('admin');
    }
}
