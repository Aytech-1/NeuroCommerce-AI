<?php

declare(strict_types=1);

namespace App\Modules\Auth\Listeners;

use App\Modules\Auth\Events\PasswordReset;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

/**
 * Class SendPasswordChangedNotification
 *
 * @package App\Modules\Auth\Listeners
 */
class SendPasswordChangedNotification implements ShouldQueue
{
    /**
     * Handle the event.
     *
     * @param PasswordReset $event
     * @return void
     */
    public function handle(PasswordReset $event): void
    {
        Log::info("Password changed notification sent to user {$event->user->email}");
    }
}
