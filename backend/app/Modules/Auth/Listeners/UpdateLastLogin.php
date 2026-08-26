<?php

declare(strict_types=1);

namespace App\Modules\Auth\Listeners;

use App\Modules\Auth\Contracts\UserRepositoryInterface;
use App\Modules\Auth\Events\UserLoggedIn;

/**
 * Class UpdateLastLogin
 *
 * @package App\Modules\Auth\Listeners
 */
class UpdateLastLogin
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository
    ) {
    }

    /**
     * Handle the event.
     *
     * @param UserLoggedIn $event
     * @return void
     */
    public function handle(UserLoggedIn $event): void
    {
        $this->userRepository->updateLastLogin($event->user->id, $event->ip);
    }
}
