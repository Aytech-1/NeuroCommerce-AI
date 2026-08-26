<?php

declare(strict_types=1);

namespace App\Modules\Admin\Controllers\Admin;

use App\Core\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Modules\Admin\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Class DashboardController
 *
 * @package App\Modules\Admin\Controllers\Admin
 */
class DashboardController extends Controller
{
    public function __construct(
        protected readonly DashboardService $dashboardService
    ) {
    }

    public function summary(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('dashboard.view')) {
            return ResponseHelper::forbidden('You do not have permission to view dashboard.');
        }

        $summary = $this->dashboardService->getSummary();
        return ResponseHelper::success($summary, 'Dashboard summary retrieved successfully.');
    }

    public function salesChart(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('dashboard.view')) {
            return ResponseHelper::forbidden('You do not have permission to view dashboard.');
        }

        $period = (string) $request->query('period', 'daily');
        $chart = $this->dashboardService->getSalesChart($period);
        return ResponseHelper::success($chart, 'Sales chart data retrieved successfully.');
    }

    public function recentOrders(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('dashboard.view')) {
            return ResponseHelper::forbidden('You do not have permission to view dashboard.');
        }

        $limit = min(50, max(1, (int) $request->query('limit', 10)));
        $orders = $this->dashboardService->getRecentOrders($limit);
        return ResponseHelper::success($orders, 'Recent orders retrieved successfully.');
    }

    public function topProducts(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('dashboard.view')) {
            return ResponseHelper::forbidden('You do not have permission to view dashboard.');
        }

        $limit = min(50, max(1, (int) $request->query('limit', 5)));
        $products = $this->dashboardService->getTopProducts($limit);
        return ResponseHelper::success($products, 'Top products retrieved successfully.');
    }

    public function lowStock(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('dashboard.view')) {
            return ResponseHelper::forbidden('You do not have permission to view dashboard.');
        }

        $limit = min(50, max(1, (int) $request->query('limit', 10)));
        $items = $this->dashboardService->getLowStock($limit);
        return ResponseHelper::success($items, 'Low stock items retrieved successfully.');
    }

    public function recentReviews(Request $request): JsonResponse
    {
        if ($request->user() && !$request->user()->can('dashboard.view')) {
            return ResponseHelper::forbidden('You do not have permission to view dashboard.');
        }

        $limit = min(50, max(1, (int) $request->query('limit', 5)));
        $reviews = $this->dashboardService->getRecentReviews($limit);
        return ResponseHelper::success($reviews, 'Recent reviews retrieved successfully.');
    }
}
