<?php

declare(strict_types=1);

namespace App\Modules\Review\Events;

use App\Modules\Review\Models\Review;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class ReviewRejected
 *
 * Dispatched when a review is rejected by a moderator.
 *
 * @package App\Modules\Review\Events
 */
class ReviewRejected
{
    use Dispatchable;
    use SerializesModels;

    /**
     * ReviewRejected constructor.
     *
     * @param Review $review
     */
    public function __construct(
        public readonly Review $review
    ) {}
}
