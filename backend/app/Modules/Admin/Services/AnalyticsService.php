<?php

declare(strict_types=1);

namespace App\Modules\Admin\Services;

use App\Core\Abstracts\AbstractService;
use App\Modules\Admin\Contracts\AnalyticsRepositoryInterface;
use App\Modules\Admin\DTOs\AnalyticsPeriodDTO;
use Illuminate\Database\Eloquent\Collection;

/**
 * Class AnalyticsService
 *
 * @package App\Modules\Admin\Services
 */
class AnalyticsService extends AbstractService
{
    public function __construct(
        protected readonly AnalyticsRepositoryInterface $analyticsRepository
    ) {
    }

    public function getSalesMetrics(AnalyticsPeriodDTO $dto): array
    {
        return $this->analyticsRepository->getSalesSummary($dto->startDate, $dto->endDate);
    }

    public function getSalesChart(AnalyticsPeriodDTO $dto): array
    {
        return $this->analyticsRepository->getSalesChartData($dto->startDate, $dto->endDate, $dto->granularity);
    }

    public function getCustomerMetrics(AnalyticsPeriodDTO $dto): array
    {
        return $this->analyticsRepository->getCustomerMetrics($dto->startDate, $dto->endDate);
    }

    public function getCustomerSegments(): array
    {
        return $this->analyticsRepository->getCustomerSegments();
    }

    public function getTopProducts(AnalyticsPeriodDTO $dto): Collection
    {
        return $this->analyticsRepository->getTopProducts($dto->startDate, $dto->endDate, $dto->limit, $dto->sortBy ?? 'revenue');
    }

    public function getProductAnalytics(string $productId, AnalyticsPeriodDTO $dto): array
    {
        return $this->analyticsRepository->getProductAnalytics($productId, $dto->startDate, $dto->endDate);
    }

    public function getTrafficMetrics(AnalyticsPeriodDTO $dto): array
    {
        return $this->analyticsRepository->getTrafficMetrics($dto->startDate, $dto->endDate);
    }

    public function getFunnelMetrics(AnalyticsPeriodDTO $dto): array
    {
        return $this->analyticsRepository->getFunnelMetrics($dto->startDate, $dto->endDate);
    }

    public function getRevenueBreakdown(AnalyticsPeriodDTO $dto): array
    {
        return $this->analyticsRepository->getRevenueBreakdown($dto->startDate, $dto->endDate, $dto->granularity);
    }

    public function getRevenueByCategory(AnalyticsPeriodDTO $dto): array
    {
        return $this->analyticsRepository->getRevenueByCategory($dto->startDate, $dto->endDate);
    }

    public function getRevenueByBrand(AnalyticsPeriodDTO $dto): array
    {
        return $this->analyticsRepository->getRevenueByBrand($dto->startDate, $dto->endDate);
    }

    public function getInventoryHealth(): array
    {
        return $this->analyticsRepository->getInventoryHealth();
    }

    public function getInventoryTurnover(AnalyticsPeriodDTO $dto): array
    {
        return $this->analyticsRepository->getInventoryTurnover($dto->startDate, $dto->endDate);
    }

    public function getAiMetrics(AnalyticsPeriodDTO $dto): array
    {
        return $this->analyticsRepository->getAiRecommendationMetrics($dto->startDate, $dto->endDate);
    }

    public function getKpiSummary(string $periodType = 'daily', ?string $periodValue = null): Collection
    {
        return $this->analyticsRepository->getKpiSummary($periodType, $periodValue);
    }
}
