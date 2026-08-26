<?php

declare(strict_types=1);

namespace App\Modules\Auth\Events;

use App\Modules\Auth\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class PasswordReset
 *
 * @package App\Modules\Auth\Events
 */
class PasswordReset
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param User $user
     */
    public function __construct(
        public readonly User $user
    ) {
    }
}
