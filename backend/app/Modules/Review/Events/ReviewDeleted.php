<?php

declare(strict_types=1);

namespace App\Modules\Review\Events;

use App\Modules\Review\Models\Review;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class ReviewDeleted
 *
 * Dispatched when a review is deleted.
 *
 * @package App\Modules\Review\Events
 */
class ReviewDeleted
{
    use Dispatchable;
    use SerializesModels;

    /**
     * ReviewDeleted constructor.
     *
     * @param Review $review
     */
    public function __construct(
        public readonly Review $review
    ) {}
}
