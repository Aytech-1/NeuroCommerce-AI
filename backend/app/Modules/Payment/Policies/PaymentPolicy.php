<?php

declare(strict_types=1);

namespace App\Modules\Payment\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Payment\Models\Payment;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * Class PaymentPolicy
 *
 * @package App\Modules\Payment\Policies
 */
class PaymentPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->can('payment.view');
    }

    public function view(User $user, Payment $payment): bool
    {
        if ($user->can('payment.view')) {
            return true;
        }

        // Customers can view only payments associated with their own orders
        return $payment->order && (string) $payment->order->user_id === (string) $user->id;
    }

    public function refund(User $user, Payment $payment): bool
    {
        return $user->can('payment.refund');
    }
}
