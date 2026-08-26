<?php

declare(strict_types=1);

namespace App\Modules\Cart\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Cart\Models\Wishlist;

/**
 * Wishlist Authorization Policy
 */
class WishlistPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('super_admin')) {
            return true;
        }

        return null;
    }

    public function view(User $user, Wishlist $wishlist): bool
    {
        return $wishlist->user_id === $user->id || $wishlist->is_public || $user->hasRole('admin');
    }

    public function update(User $user, Wishlist $wishlist): bool
    {
        return $wishlist->user_id === $user->id || $user->hasRole('admin');
    }

    public function delete(User $user, Wishlist $wishlist): bool
    {
        return $wishlist->user_id === $user->id || $user->hasRole('admin');
    }
}
