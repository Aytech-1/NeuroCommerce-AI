<?php

declare(strict_types=1);

namespace App\Modules\Admin\Services;

use App\Core\Abstracts\AbstractService;
use App\Modules\Admin\Contracts\AnalyticsRepositoryInterface;
use App\Modules\Admin\Enums\CustomerSegment;
use App\Modules\Admin\Enums\KpiPeriodType;
use App\Modules\Auth\Models\User;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Class AnalyticsAggregationService
 *
 * @package App\Modules\Admin\Services
 */
class AnalyticsAggregationService extends AbstractService
{
    public function __construct(
        protected readonly AnalyticsRepositoryInterface $analyticsRepository
    ) {
    }

    public function aggregateDailySales(?string $targetDate = null): void
    {
        $date = $targetDate ? CarbonImmutable::parse($targetDate) : CarbonImmutable::yesterday();
        $start = $date->startOfDay();
        $end = $date->endOfDay();

        Log::info("[AnalyticsAggregationService] Aggregating daily sales for {$date->toDateString()}");

        $orders = Order::whereBetween('created_at', [$start->toDateTimeString(), $end->toDateTimeString()])
            ->where('status', '!=', OrderStatus::CANCELLED->value)
            ->get();

        $totalOrders = $orders->count();
        $grossRevenue = (float) $orders->sum('total_amount');
        $taxTotal = (float) $orders->sum('tax_amount');
        $shippingTotal = (float) $orders->sum('shipping_amount');
        $discountTotal = (float) $orders->sum('discount_amount');
        $netRevenue = (float) $orders->sum('subtotal');
        $aov = $totalOrders > 0 ? round($grossRevenue / $totalOrders, 4) : 0.0;

        $uniqueUsers = $orders->whereNotNull('user_id')->pluck('user_id')->unique()->count();
        $totalItems = (int) OrderItem::whereIn('order_id', $orders->pluck('id'))->sum('quantity');

        $data = [
            'date' => $date->toDateString(),
            'total_orders' => $totalOrders,
            'total_revenue' => $grossRevenue,
            'total_tax' => $taxTotal,
            'total_shipping' => $shippingTotal,
            'total_discounts' => $discountTotal,
            'net_revenue' => $netRevenue,
            'avg_order_value' => $aov,
            'total_items_sold' => $totalItems,
            'unique_customers' => $uniqueUsers,
            'new_customers' => $uniqueUsers,
            'returning_customers' => 0,
            'refund_count' => 0,
            'refund_amount' => 0.0,
            'currency_code' => 'USD',
        ];

        $this->analyticsRepository->upsertDailySales($data);
    }

    public function aggregateCustomerMetrics(): void
    {
        Log::info('[AnalyticsAggregationService] Aggregating customer RFM metrics');

        $userIds = Order::whereNotNull('user_id')
            ->where('status', '!=', OrderStatus::CANCELLED->value)
            ->pluck('user_id')
            ->unique();

        foreach ($userIds as $userId) {
            $orders = Order::where('user_id', $userId)
                ->where('status', '!=', OrderStatus::CANCELLED->value)
                ->orderBy('created_at', 'asc')
                ->get();

            $orderCount = $orders->count();
            if ($orderCount === 0) {
                continue;
            }

            $totalSpent = (float) $orders->sum('total_amount');
            $aov = round($totalSpent / $orderCount, 4);
            $firstOrder = $orders->first()->created_at;
            $lastOrder = $orders->last()->created_at;

            $daysSinceLast = (int) now()->diffInDays($lastOrder);

            // RFM Segmentation logic
            if ($daysSinceLast > 90) {
                $segment = CustomerSegment::CHURNED;
            } elseif ($daysSinceLast > 45) {
                $segment = CustomerSegment::AT_RISK;
            } elseif ($orderCount >= 5 || $totalSpent >= 500) {
                $segment = CustomerSegment::LOYAL;
            } elseif ($orderCount >= 2) {
                $segment = CustomerSegment::ACTIVE;
            } else {
                $segment = CustomerSegment::NEW;
            }

            $this->analyticsRepository->upsertCustomerAnalytics((string) $userId, [
                'total_orders' => $orderCount,
                'total_spent' => $totalSpent,
                'avg_order_value' => $aov,
                'first_order_at' => $firstOrder,
                'last_order_at' => $lastOrder,
                'customer_segment' => $segment->value,
                'lifetime_value' => $totalSpent,
            ]);
        }
    }

    public function materializeKpis(): void
    {
        Log::info('[AnalyticsAggregationService] Materializing KPIs');

        $todayStr = now()->toDateString();

        $totalRevenue = (float) Order::where('status', '!=', OrderStatus::CANCELLED->value)->sum('total_amount');
        $totalOrders = (int) Order::where('status', '!=', OrderStatus::CANCELLED->value)->count();
        $totalCustomers = (int) User::count();

        $this->analyticsRepository->upsertKpi('total_revenue', $totalRevenue, KpiPeriodType::DAILY->value, $todayStr);
        $this->analyticsRepository->upsertKpi('total_orders', (float) $totalOrders, KpiPeriodType::DAILY->value, $todayStr);
        $this->analyticsRepository->upsertKpi('total_customers', (float) $totalCustomers, KpiPeriodType::DAILY->value, $todayStr);
    }
}
