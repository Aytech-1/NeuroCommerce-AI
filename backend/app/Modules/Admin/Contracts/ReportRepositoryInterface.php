<?php

declare(strict_types=1);

namespace App\Modules\Admin\Contracts;

use Carbon\CarbonInterface;
use Illuminate\Support\LazyCollection;

/**
 * Interface ReportRepositoryInterface
 *
 * @package App\Modules\Admin\Contracts
 */
interface ReportRepositoryInterface
{
    public function getOrdersReportCursor(CarbonInterface $startDate, CarbonInterface $endDate, array $filters = []): LazyCollection;

    public function getTaxSummaryReport(CarbonInterface $startDate, CarbonInterface $endDate): array;

    public function getInventoryValuationReport(): array;

    public function getCustomerCohortReport(CarbonInterface $startDate, CarbonInterface $endDate): array;
}
