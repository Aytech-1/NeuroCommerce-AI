<?php

declare(strict_types=1);

namespace App\Modules\Review\Events;

use App\Modules\Review\Models\Review;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class ReviewUpdated
 *
 * Dispatched when a review's content or rating is updated.
 *
 * @package App\Modules\Review\Events
 */
class ReviewUpdated
{
    use Dispatchable;
    use SerializesModels;

    /**
     * ReviewUpdated constructor.
     *
     * @param Review $review
     */
    public function __construct(
        public readonly Review $review
    ) {}
}
