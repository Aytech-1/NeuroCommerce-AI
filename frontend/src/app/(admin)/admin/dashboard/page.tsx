"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Can } from "@/components/ui/can";
import {
  useDashboardSummary,
  useSalesChart,
  useRecentOrders,
  useTopProducts,
  useLowStock,
  DASHBOARD_QUERY_KEYS,
} from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth-store";
import { DashboardFilters, AnalyticsPeriod } from "@/components/dashboard/dashboard-filters";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { SalesRevenueChart } from "@/components/dashboard/sales-revenue-chart";
import { TopProductsCard } from "@/components/dashboard/top-products-card";
import { LowStockWidget } from "@/components/dashboard/low-stock-widget";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import {
  Plus,
  ShoppingCart,
  Tag,
  ShieldAlert,
  Settings,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [period, setPeriod] = useState<AnalyticsPeriod>("daily");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // TanStack Queries for authoritative backend data
  const summaryQuery = useDashboardSummary();
  const salesChartQuery = useSalesChart(period);
  const recentOrdersQuery = useRecentOrders(8);
  const topProductsQuery = useTopProducts(5);
  const lowStockQuery = useLowStock(6);

  const adminName = user?.first_name || (user?.email ? user.email.split("@")[0] : "Administrator");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.summary }),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.salesChart(period) }),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.recentOrders(8) }),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.topProducts(5) }),
        queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.lowStock(6) }),
      ]);
      toast.success("Dashboard telemetry synchronized");
    } finally {
      setIsRefreshing(false);
    }
  };

  const periodLabels: Record<AnalyticsPeriod, string> = {
    daily: "Last 30 Days (Daily)",
    weekly: "Last 12 Weeks (Weekly)",
    monthly: "Last 12 Months (Monthly)",
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB & EXECUTIVE HEADER                                        */}
      {/* ======================================================================= */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Admin Portal</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Executive Dashboard
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              COMMERCIAL OPERATIONS CENTER
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {adminName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Real-time commercial telemetry, revenue curves, order flow, and inventory health.
            </p>
          </div>

          {/* Quick Actions Group */}
          <div className="flex items-center gap-2 flex-wrap">
            <Can permission="product.create">
              <Link
                href="/admin/products/create"
                className="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Add Product</span>
              </Link>
            </Can>

            <Can permission="order.view">
              <Link
                href="/admin/orders"
                className="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <ShoppingCart className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <span>Orders</span>
              </Link>
            </Can>

            <Can permission="settings.view">
              <Link
                href="/admin/settings"
                className="h-10 px-3.5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                title="System Settings"
              >
                <Settings className="h-4 w-4 text-slate-500" aria-hidden="true" />
              </Link>
            </Can>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. DATE RANGE & TELEMETRY REFRESH BAR                                   */}
      {/* ======================================================================= */}
      <DashboardFilters
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* ======================================================================= */}
      {/* 3. PRIMARY KPI METRICS GRID                                             */}
      {/* ======================================================================= */}
      <KpiCards
        summary={summaryQuery.data}
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
        onRetry={() => summaryQuery.refetch()}
      />

      {/* ======================================================================= */}
      {/* 4. SALES & REVENUE CHART                                                */}
      {/* ======================================================================= */}
      <SalesRevenueChart
        data={salesChartQuery.data}
        isLoading={salesChartQuery.isLoading}
        isError={salesChartQuery.isError}
        periodLabel={periodLabels[period]}
      />

      {/* ======================================================================= */}
      {/* 5. TOP PRODUCTS & LOW STOCK WIDGETS                                     */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Can permission="product.view">
          <TopProductsCard
            products={topProductsQuery.data}
            isLoading={topProductsQuery.isLoading}
            isError={topProductsQuery.isError}
          />
        </Can>

        <Can permission="inventory.view">
          <LowStockWidget
            items={lowStockQuery.data}
            isLoading={lowStockQuery.isLoading}
            isError={lowStockQuery.isError}
          />
        </Can>
      </div>

      {/* ======================================================================= */}
      {/* 6. RECENT ORDERS STREAM TABLE                                           */}
      {/* ======================================================================= */}
      <Can permission="order.view">
        <RecentOrdersTable
          orders={recentOrdersQuery.data}
          isLoading={recentOrdersQuery.isLoading}
          isError={recentOrdersQuery.isError}
        />
      </Can>
    </div>
  );
}
