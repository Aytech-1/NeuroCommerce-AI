<?php

declare(strict_types=1);

namespace App\Modules\Review\Events;

use App\Modules\Review\Models\Review;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class ReviewApproved
 *
 * Dispatched when a review is approved by a moderator.
 *
 * @package App\Modules\Review\Events
 */
class ReviewApproved
{
    use Dispatchable;
    use SerializesModels;

    /**
     * ReviewApproved constructor.
     *
     * @param Review $review
     */
    public function __construct(
        public readonly Review $review
    ) {}
}
