<?php

declare(strict_types=1);

namespace App\Modules\Auth\Listeners;

use App\Modules\Auth\Events\UserLoggedOut;
use Illuminate\Support\Facades\Log;

/**
 * Class TrackLogoutEvent
 *
 * @package App\Modules\Auth\Listeners
 */
class TrackLogoutEvent
{
    /**
     * Handle the event.
     *
     * @param UserLoggedOut $event
     * @return void
     */
    public function handle(UserLoggedOut $event): void
    {
        Log::info("User logged out: {$event->user->email}");
    }
}
