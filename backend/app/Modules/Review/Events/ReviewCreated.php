<?php

declare(strict_types=1);

namespace App\Modules\Review\Events;

use App\Modules\Review\Models\Review;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Class ReviewCreated
 *
 * Dispatched when a customer submits a new product review.
 *
 * @package App\Modules\Review\Events
 */
class ReviewCreated
{
    use Dispatchable;
    use SerializesModels;

    /**
     * ReviewCreated constructor.
     *
     * @param Review $review
     */
    public function __construct(
        public readonly Review $review
    ) {}
}
