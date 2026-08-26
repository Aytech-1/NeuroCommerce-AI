<?php

declare(strict_types=1);

namespace App\Modules\Admin\Jobs;

use App\Modules\Admin\Services\AnalyticsAggregationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Class GenerateDailySalesReportsJob
 *
 * @package App\Modules\Admin\Jobs
 */
class GenerateDailySalesReportsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(
        public readonly ?string $targetDate = null
    ) {
        $this->onQueue('bulk');
    }

    public function handle(AnalyticsAggregationService $aggregationService): void
    {
        Log::info('[GenerateDailySalesReportsJob] Running nightly daily sales and KPI aggregation job');

        $aggregationService->aggregateDailySales($this->targetDate);
        $aggregationService->aggregateCustomerMetrics();
        $aggregationService->materializeKpis();
    }
}
