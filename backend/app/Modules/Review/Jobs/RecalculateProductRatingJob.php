<?php

declare(strict_types=1);

namespace App\Modules\Review\Jobs;

use App\Modules\Catalog\Models\Product;
use App\Modules\Review\Contracts\ReviewRepositoryInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class RecalculateProductRatingJob
 *
 * Asynchronously calculates and persists aggregate rating statistics for a product.
 *
 * @package App\Modules\Review\Jobs
 */
class RecalculateProductRatingJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    /**
     * RecalculateProductRatingJob constructor.
     *
     * @param string $productId
     */
    public function __construct(
        public readonly string $productId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(ReviewRepositoryInterface $reviewRepository): void
    {
        try {
            $stats = $reviewRepository->calculateProductRatingStats($this->productId);

            Product::where('id', $this->productId)->update([
                'avg_rating' => (string) $stats['average_rating'],
                'review_count' => $stats['review_count'],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to recalculate product rating stats', [
                'product_id' => $this->productId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
