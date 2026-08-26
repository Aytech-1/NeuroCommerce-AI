<?php

declare(strict_types=1);

namespace App\Modules\Admin\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Catalog\Models\Product;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Review\Models\Review;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Class DashboardService
 *
 * Operational dashboard metrics and insights aggregator.
 *
 * @package App\Modules\Admin\Services
 */
class DashboardService
{
    public function getSummary(): array
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        $totalRevenue = (float) Order::where('status', '!=', OrderStatus::CANCELLED->value)->sum('total_amount');
        $monthRevenue = (float) Order::where('status', '!=', OrderStatus::CANCELLED->value)
            ->where('created_at', '>=', $startOfMonth)
            ->sum('total_amount');

        $totalOrders = Order::count();
        $monthOrders = Order::where('created_at', '>=', $startOfMonth)->count();

        $totalCustomers = User::where('user_type', 'customer')->count();
        $newCustomersThisMonth = User::where('user_type', 'customer')
            ->where('created_at', '>=', $startOfMonth)
            ->count();

        $totalProducts = Product::count();
        $activeProducts = Product::where('status', 'published')->count();

        return [
            'revenue' => [
                'total' => $totalRevenue,
                'this_month' => $monthRevenue,
            ],
            'orders' => [
                'total' => $totalOrders,
                'this_month' => $monthOrders,
            ],
            'customers' => [
                'total' => $totalCustomers,
                'new_this_month' => $newCustomersThisMonth,
            ],
            'products' => [
                'total' => $totalProducts,
                'active' => $activeProducts,
            ],
        ];
    }

    public function getSalesChart(string $period = 'daily'): array
    {
        $startDate = match ($period) {
            'monthly' => Carbon::now()->subMonths(12)->startOfMonth(),
            'weekly' => Carbon::now()->subWeeks(12)->startOfWeek(),
            default => Carbon::now()->subDays(30)->startOfDay(),
        };

        $orders = Order::where('status', '!=', OrderStatus::CANCELLED->value)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as order_count, SUM(total_amount) as total_sales')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $orders->map(fn ($row) => [
            'date' => (string) $row->date,
            'orders' => (int) $row->order_count,
            'revenue' => (float) $row->total_sales,
        ])->toArray();
    }

    public function getRecentOrders(int $limit = 10): Collection
    {
        return Order::with(['user:id,first_name,last_name,email', 'items'])
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }

    public function getTopProducts(int $limit = 5): Collection
    {
        return Product::with(['category:id,name', 'brand:id,name'])
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get();
    }

    public function getLowStock(int $limit = 10): Collection
    {
        return Product::query()
            ->where('stock_status', 'out_of_stock')
            ->orWhere('stock_quantity', '<=', 5)
            ->with(['category:id,name'])
            ->limit($limit)
            ->get();
    }

    public function getRecentReviews(int $limit = 5): Collection
    {
        return Review::with(['product:id,name,slug', 'user:id,first_name,last_name'])
            ->latest('created_at')
            ->limit($limit)
            ->get();
    }
}
