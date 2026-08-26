<?php

declare(strict_types=1);

use App\Modules\Admin\Controllers\Admin\AdminNotificationController;
use App\Modules\Admin\Controllers\Admin\AnalyticsController;
use App\Modules\Admin\Controllers\Admin\AuditLogController;
use App\Modules\Admin\Controllers\Admin\DashboardController;
use App\Modules\Admin\Controllers\Admin\FeatureFlagController;
use App\Modules\Admin\Controllers\Admin\ReportController;
use App\Modules\Admin\Controllers\Admin\SettingController;
use App\Modules\Admin\Controllers\Admin\SystemConfigController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Module — Administration, Governance & Analytics API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1/admin')->middleware(['api', 'auth:sanctum'])->group(function () {
    // 4.1 Dashboard
    Route::prefix('dashboard')->group(function () {
        Route::get('summary', [DashboardController::class, 'summary']);
        Route::get('sales-chart', [DashboardController::class, 'salesChart']);
        Route::get('recent-orders', [DashboardController::class, 'recentOrders']);
        Route::get('top-products', [DashboardController::class, 'topProducts']);
        Route::get('low-stock', [DashboardController::class, 'lowStock']);
        Route::get('recent-reviews', [DashboardController::class, 'recentReviews']);
    });

    // 4.4 Settings & Configuration
    Route::prefix('settings')->group(function () {
        Route::get('/', [SettingController::class, 'index']);
        Route::get('{group}', [SettingController::class, 'byGroup']);
        Route::put('/', [SettingController::class, 'bulkUpdate']);
    });

    Route::prefix('system-config')->group(function () {
        Route::get('/', [SystemConfigController::class, 'index']);
        Route::put('{namespace}', [SystemConfigController::class, 'update']);
    });

    Route::prefix('feature-flags')->group(function () {
        Route::get('/', [FeatureFlagController::class, 'index']);
        Route::patch('{name}', [FeatureFlagController::class, 'toggle']);
    });

    // 4.5 Audit & Activity Logs
    Route::prefix('audit-logs')->group(function () {
        Route::get('/', [AuditLogController::class, 'index']);
        Route::get('{id}', [AuditLogController::class, 'show']);
    });

    Route::prefix('activity-logs')->group(function () {
        Route::get('/', [AuditLogController::class, 'activityLogs']);
        Route::get('user/{userId}', [AuditLogController::class, 'userActivityLogs']);
    });

    // 4.6 Admin Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [AdminNotificationController::class, 'index']);
        Route::get('unread-count', [AdminNotificationController::class, 'unreadCount']);
        Route::patch('{id}/read', [AdminNotificationController::class, 'markAsRead']);
        Route::post('mark-all-read', [AdminNotificationController::class, 'markAllRead']);
    });

    // Analytics Endpoints (Phase 13)
    Route::prefix('analytics')->group(function () {
        Route::get('sales', [AnalyticsController::class, 'sales']);
        Route::get('sales/chart', [AnalyticsController::class, 'salesChart']);
        Route::get('customers', [AnalyticsController::class, 'customers']);
        Route::get('customers/segments', [AnalyticsController::class, 'customerSegments']);
        Route::get('products', [AnalyticsController::class, 'products']);
        Route::get('products/{id}', [AnalyticsController::class, 'productDetail']);
        Route::get('behavior', [AnalyticsController::class, 'behavior']);
        Route::get('behavior/funnel', [AnalyticsController::class, 'behaviorFunnel']);
        Route::get('revenue', [AnalyticsController::class, 'revenue']);
        Route::get('revenue/by-category', [AnalyticsController::class, 'revenueByCategory']);
        Route::get('revenue/by-brand', [AnalyticsController::class, 'revenueByBrand']);
        Route::get('inventory', [AnalyticsController::class, 'inventory']);
        Route::get('inventory/turnover', [AnalyticsController::class, 'inventoryTurnover']);
        Route::get('ai', [AnalyticsController::class, 'aiMetrics']);
        Route::get('kpis', [AnalyticsController::class, 'kpis']);
    });

    // Report Endpoints (Phase 13)
    Route::prefix('reports')->group(function () {
        Route::post('orders/export', [ReportController::class, 'exportOrders'])->middleware('throttle:10,1');
        Route::post('tax/export', [ReportController::class, 'exportTax'])->middleware('throttle:10,1');
        Route::post('inventory/export', [ReportController::class, 'exportInventory'])->middleware('throttle:10,1');
    });
});
