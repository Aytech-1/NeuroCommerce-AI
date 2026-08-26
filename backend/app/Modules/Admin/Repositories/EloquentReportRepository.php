<?php

declare(strict_types=1);

namespace App\Modules\Admin\Repositories;

use App\Modules\Admin\Contracts\ReportRepositoryInterface;
use App\Modules\Catalog\Models\Product;
use App\Modules\Inventory\Models\InventoryItem;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\LazyCollection;

/**
 * Class EloquentReportRepository
 *
 * @package App\Modules\Admin\Repositories
 */
class EloquentReportRepository implements ReportRepositoryInterface
{
    public function getOrdersReportCursor(CarbonInterface $startDate, CarbonInterface $endDate, array $filters = []): LazyCollection
    {
        $query = Order::with(['user:id,first_name,last_name,email', 'items.product:id,name,sku'])
            ->whereBetween('created_at', [$startDate->toDateTimeString(), $endDate->toDateTimeString()]);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['currency_code'])) {
            $query->where('currency_code', $filters['currency_code']);
        }

        return $query->orderBy('created_at', 'asc')->cursor();
    }

    public function getTaxSummaryReport(CarbonInterface $startDate, CarbonInterface $endDate): array
    {
        $results = Order::whereBetween('created_at', [$startDate->toDateTimeString(), $endDate->toDateTimeString()])
            ->where('status', '!=', OrderStatus::CANCELLED->value)
            ->select(
                'currency_code',
                DB::raw('COUNT(id) as total_taxable_orders'),
                DB::raw('SUM(subtotal) as taxable_amount'),
                DB::raw('SUM(tax_amount) as tax_collected')
            )
            ->groupBy('currency_code')
            ->get();

        return $results->toArray();
    }

    public function getInventoryValuationReport(): array
    {
        $results = InventoryItem::join('products', 'inventory_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.sku',
                'products.name',
                'products.base_price',
                'products.cost_price',
                'inventory_items.quantity_on_hand as quantity',
                DB::raw('(inventory_items.quantity_on_hand * products.cost_price) as total_cost_value'),
                DB::raw('(inventory_items.quantity_on_hand * products.base_price) as total_retail_value')
            )
            ->where('inventory_items.quantity_on_hand', '>', 0)
            ->get();

        $totalCostValue = (float) $results->sum('total_cost_value');
        $totalRetailValue = (float) $results->sum('total_retail_value');
        $totalUnits = (int) $results->sum('quantity');

        return [
            'summary' => [
                'total_products' => $results->count(),
                'total_units_in_stock' => $totalUnits,
                'total_cost_valuation' => $totalCostValue,
                'total_retail_valuation' => $totalRetailValue,
                'potential_profit' => round($totalRetailValue - $totalCostValue, 4),
            ],
            'items' => $results->toArray(),
        ];
    }

    public function getCustomerCohortReport(CarbonInterface $startDate, CarbonInterface $endDate): array
    {
        $cohorts = DB::table('orders')
            ->join('users', 'orders.user_id', '=', 'users.id')
            ->whereNotNull('orders.user_id')
            ->where('orders.status', '!=', OrderStatus::CANCELLED->value)
            ->select(
                DB::raw("strftime('%Y-%m', users.created_at) as cohort_month"),
                DB::raw('COUNT(DISTINCT users.id) as cohort_size'),
                DB::raw('COUNT(orders.id) as total_orders'),
                DB::raw('SUM(orders.total_amount) as total_revenue')
            )
            ->groupBy('cohort_month')
            ->orderBy('cohort_month', 'asc')
            ->get();

        return $cohorts->toArray();
    }
}
