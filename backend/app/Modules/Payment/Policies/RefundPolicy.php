<?php

declare(strict_types=1);

namespace App\Modules\Payment\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Payment\Models\Refund;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Class RefundPolicy
 *
 * @package App\Modules\Payment\Policies
 */
class RefundPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('payment.view');
    }

    public function view(User $user, Refund $refund): bool
    {
        if ($user->can('payment.view')) {
            return true;
        }

        return $refund->order && (string) $refund->order->user_id === (string) $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can('payment.refund');
    }
}
