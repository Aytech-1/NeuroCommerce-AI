<?php

declare(strict_types=1);

namespace App\Modules\Coupon\Policies;

use App\Modules\Auth\Models\User;
use App\Modules\Coupon\Models\Coupon;

/**
 * Class CouponPolicy
 *
 * @package App\Modules\Coupon\Policies
 */
class CouponPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('coupon.view');
    }

    public function view(User $user, Coupon $coupon): bool
    {
        return $user->can('coupon.view');
    }

    public function create(User $user): bool
    {
        return $user->can('coupon.create');
    }

    public function update(User $user, Coupon $coupon): bool
    {
        return $user->can('coupon.update');
    }

    public function delete(User $user, Coupon $coupon): bool
    {
        return $user->can('coupon.delete');
    }
}
