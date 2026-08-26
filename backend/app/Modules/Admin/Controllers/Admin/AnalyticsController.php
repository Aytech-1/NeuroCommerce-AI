<?php

declare(strict_types=1);

namespace App\Modules\Admin\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Admin\Models\AnalyticsDailySales;
use App\Modules\Admin\Requests\AnalyticsQueryRequest;
use App\Modules\Admin\Services\AnalyticsService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Class AnalyticsController
 *
 * @package App\Modules\Admin\Controllers\Admin
 */
class AnalyticsController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected readonly AnalyticsService $analyticsService
    ) {
    }

    public function sales(AnalyticsQueryRequest $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getSalesMetrics($request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'Sales metrics retrieved successfully.'
        );
    }

    public function salesChart(AnalyticsQueryRequest $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getSalesChart($request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'Sales chart data retrieved successfully.'
        );
    }

    public function customers(AnalyticsQueryRequest $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getCustomerMetrics($request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'Customer metrics retrieved successfully.'
        );
    }

    public function customerSegments(Request $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getCustomerSegments();

        return ResponseHelper::success(
            data: $data,
            message: 'Customer segments retrieved successfully.'
        );
    }

    public function products(AnalyticsQueryRequest $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getTopProducts($request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'Product performance metrics retrieved successfully.'
        );
    }

    public function productDetail(AnalyticsQueryRequest $request, string $id): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getProductAnalytics($id, $request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'Single product analytics retrieved successfully.'
        );
    }

    public function behavior(AnalyticsQueryRequest $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getTrafficMetrics($request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'Behavior and traffic metrics retrieved successfully.'
        );
    }

    public function behaviorFunnel(AnalyticsQueryRequest $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getFunnelMetrics($request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'Funnel conversion analytics retrieved successfully.'
        );
    }

    public function revenue(AnalyticsQueryRequest $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getRevenueBreakdown($request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'Revenue breakdown retrieved successfully.'
        );
    }

    public function revenueByCategory(AnalyticsQueryRequest $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getRevenueByCategory($request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'Revenue by category retrieved successfully.'
        );
    }

    public function revenueByBrand(AnalyticsQueryRequest $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getRevenueByBrand($request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'Revenue by brand retrieved successfully.'
        );
    }

    public function inventory(Request $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getInventoryHealth();

        return ResponseHelper::success(
            data: $data,
            message: 'Inventory health analytics retrieved successfully.'
        );
    }

    public function inventoryTurnover(AnalyticsQueryRequest $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getInventoryTurnover($request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'Inventory turnover analytics retrieved successfully.'
        );
    }

    public function aiMetrics(AnalyticsQueryRequest $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $data = $this->analyticsService->getAiMetrics($request->toDTO());

        return ResponseHelper::success(
            data: $data,
            message: 'AI recommendation performance retrieved successfully.'
        );
    }

    public function kpis(Request $request): JsonResponse
    {
        $this->authorize('view', AnalyticsDailySales::class);

        $periodType = (string) $request->query('period_type', 'daily');
        $periodValue = $request->query('period_value') ? (string) $request->query('period_value') : null;

        $data = $this->analyticsService->getKpiSummary($periodType, $periodValue);

        return ResponseHelper::success(
            data: $data,
            message: 'KPI summary retrieved successfully.'
        );
    }
}
