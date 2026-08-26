<?php

declare(strict_types=1);

namespace App\Modules\Auth\Listeners;

use App\Modules\Auth\Events\UserLoggedIn;
use Illuminate\Support\Facades\Log;

/**
 * Class TrackLoginEvent
 *
 * @package App\Modules\Auth\Listeners
 */
class TrackLoginEvent
{
    /**
     * Handle the event.
     *
     * @param UserLoggedIn $event
     * @return void
     */
    public function handle(UserLoggedIn $event): void
    {
        Log::info("User logged in: {$event->user->email} from {$event->ip}");
    }
}
