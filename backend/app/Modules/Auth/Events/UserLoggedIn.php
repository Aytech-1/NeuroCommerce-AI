<?php

declare(strict_types=1);

namespace App\Modules\Auth\Events;

use App\Modules\Auth\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class UserLoggedIn
 *
 * Dispatched when a user successfully authenticates.
 *
 * @package App\Modules\Auth\Events
 */
class UserLoggedIn
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param User $user
     * @param string $ip
     * @param string|null $userAgent
     */
    public function __construct(
        public readonly User $user,
        public readonly string $ip,
        public readonly ?string $userAgent = null
    ) {
    }
}
