<?php

declare(strict_types=1);

namespace App\Modules\Admin\Contracts;

use App\Modules\Admin\Models\AnalyticsCustomer;
use App\Modules\Admin\Models\AnalyticsDailySales;
use App\Modules\Admin\Models\AnalyticsKpi;
use App\Modules\Admin\Models\AnalyticsMonthlyReport;
use App\Modules\Admin\Models\AnalyticsProductPerformance;
use App\Modules\Admin\Models\AnalyticsTraffic;
use Carbon\CarbonInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface AnalyticsRepositoryInterface
 *
 * @package App\Modules\Admin\Contracts
 */
interface AnalyticsRepositoryInterface
{
    public function getDailySales(CarbonInterface $startDate, CarbonInterface $endDate): Collection;

    public function getSalesSummary(CarbonInterface $startDate, CarbonInterface $endDate): array;

    public function getSalesChartData(CarbonInterface $startDate, CarbonInterface $endDate, string $granularity = 'daily'): array;

    public function getCustomerMetrics(CarbonInterface $startDate, CarbonInterface $endDate): array;

    public function getCustomerSegments(): array;

    public function getTopProducts(CarbonInterface $startDate, CarbonInterface $endDate, int $limit = 10, string $sortBy = 'revenue'): Collection;

    public function getProductAnalytics(string $productId, CarbonInterface $startDate, CarbonInterface $endDate): array;

    public function getTrafficMetrics(CarbonInterface $startDate, CarbonInterface $endDate): array;

    public function getFunnelMetrics(CarbonInterface $startDate, CarbonInterface $endDate): array;

    public function getRevenueBreakdown(CarbonInterface $startDate, CarbonInterface $endDate, string $granularity = 'daily'): array;

    public function getRevenueByCategory(CarbonInterface $startDate, CarbonInterface $endDate): array;

    public function getRevenueByBrand(CarbonInterface $startDate, CarbonInterface $endDate): array;

    public function getInventoryHealth(): array;

    public function getInventoryTurnover(CarbonInterface $startDate, CarbonInterface $endDate): array;

    public function getAiRecommendationMetrics(CarbonInterface $startDate, CarbonInterface $endDate): array;

    public function getKpiSummary(string $periodType = 'daily', ?string $periodValue = null): Collection;

    public function upsertDailySales(array $data): AnalyticsDailySales;

    public function upsertKpi(string $name, float $value, string $periodType, string $periodValue, ?array $metadata = null): AnalyticsKpi;

    public function upsertCustomerAnalytics(string $userId, array $data): AnalyticsCustomer;

    public function upsertProductPerformance(string $productId, string $date, array $data): AnalyticsProductPerformance;
}
