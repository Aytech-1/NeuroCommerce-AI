<?php

declare(strict_types=1);

namespace App\Modules\Auth\Listeners;

use App\Modules\Auth\Events\UserRegistered;
use App\Modules\Auth\Models\CustomerProfile;

/**
 * Class CreateCustomerProfile
 *
 * @package App\Modules\Auth\Listeners
 */
class CreateCustomerProfile
{
    /**
     * Handle the event.
     *
     * @param UserRegistered $event
     * @return void
     */
    public function handle(UserRegistered $event): void
    {
        $user = $event->user;

        if ($user->isCustomer() && ! $user->customerProfile()->exists()) {
            CustomerProfile::create([
                'user_id' => $user->id,
                'customer_group' => 'regular',
                'loyalty_points' => 0,
            ]);
        }
    }
}
