<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Events;

use App\Modules\Catalog\Models\Category;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class CategoryUpdated
 *
 * @package App\Modules\Catalog\Events
 */
class CategoryUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Category $category)
    {
    }
}
