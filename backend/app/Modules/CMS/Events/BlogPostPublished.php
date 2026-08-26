<?php

declare(strict_types=1);

namespace App\Modules\CMS\Events;

use App\Modules\CMS\Models\BlogPost;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class BlogPostPublished
 *
 * @package App\Modules\CMS\Events
 */
class BlogPostPublished
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly BlogPost $post)
    {
    }
}
