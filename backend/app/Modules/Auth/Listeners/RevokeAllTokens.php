<?php

declare(strict_types=1);

namespace App\Modules\Auth\Listeners;

use App\Modules\Auth\Events\AccountDeactivated;
use App\Modules\Auth\Events\PasswordReset;

/**
 * Class RevokeAllTokens
 *
 * @package App\Modules\Auth\Listeners
 */
class RevokeAllTokens
{
    /**
     * Handle the event.
     *
     * @param PasswordReset|AccountDeactivated $event
     * @return void
     */
    public function handle(PasswordReset|AccountDeactivated $event): void
    {
        $event->user->tokens()->delete();
    }
}
