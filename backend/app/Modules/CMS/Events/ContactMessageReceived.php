<?php

declare(strict_types=1);

namespace App\Modules\CMS\Events;

use App\Modules\CMS\DTOs\ContactMessageDTO;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class ContactMessageReceived
 *
 * @package App\Modules\CMS\Events
 */
class ContactMessageReceived
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly ContactMessageDTO $messageDTO)
    {
    }
}
