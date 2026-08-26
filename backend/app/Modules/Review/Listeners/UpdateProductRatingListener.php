<?php

declare(strict_types=1);

namespace App\Modules\Review\Listeners;

use App\Modules\Review\Events\ReviewApproved;
use App\Modules\Review\Events\ReviewDeleted;
use App\Modules\Review\Events\ReviewRejected;
use App\Modules\Review\Events\ReviewUpdated;
use App\Modules\Review\Jobs\RecalculateProductRatingJob;

/**
 * Class UpdateProductRatingListener
 *
 * Listens for review status or rating modifications and dispatches aggregation jobs.
 *
 * @package App\Modules\Review\Listeners
 */
class UpdateProductRatingListener
{
    /**
     * Handle the event.
     *
     * @param ReviewApproved|ReviewRejected|ReviewDeleted|ReviewUpdated $event
     */
    public function handle(object $event): void
    {
        if (isset($event->review) && !empty($event->review->product_id)) {
            RecalculateProductRatingJob::dispatch($event->review->product_id);
        }
    }
}
