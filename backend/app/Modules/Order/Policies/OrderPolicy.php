<?php

declare(strict_types=1);

namespace App\Modules\Order\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Order\Models\Order;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Class OrderPolicy
 *
 * Enforces authorization checks and IDOR defenses for Order resources.
 *
 * @package App\Modules\Order\Policies
 */
class OrderPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('order.view');
    }

    public function view(User $user, Order $order): bool
    {
        if ($user->can('order.view')) {
            return true;
        }

        return $order->user_id !== null && $order->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->can('order.update');
    }

    public function cancel(User $user, Order $order): bool
    {
        if ($user->can('order.update')) {
            return true;
        }

        return $order->user_id !== null
            && $order->user_id === $user->id
            && $order->status->isCancellable();
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->hasRole('super_admin');
    }
}
