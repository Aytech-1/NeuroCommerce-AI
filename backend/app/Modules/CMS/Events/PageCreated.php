<?php

declare(strict_types=1);

namespace App\Modules\CMS\Events;

use App\Modules\CMS\Models\Page;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class PageCreated
 *
 * @package App\Modules\CMS\Events
 */
class PageCreated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Page $page)
    {
    }
}
