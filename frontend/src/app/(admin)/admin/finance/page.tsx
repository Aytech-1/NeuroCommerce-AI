"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  RotateCcw,
  Truck,
  Percent,
  Download,
  RefreshCw,
  Calendar,
  Layers,
  Tag,
  Package,
  AlertCircle,
  FileSpreadsheet,
  Building2,
  ChevronRight,
  Info,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Can } from "@/components/ui/can";
import {
  useFinanceSalesSummary,
  useFinanceSalesChart,
  useFinanceRevenueByCategory,
  useFinanceRevenueByBrand,
  useFinanceTaxReport,
  useFinanceInventoryValuation,
  useExportOrdersMutation,
  FINANCE_QUERY_KEYS,
} from "@/hooks/use-finance";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

type DatePreset = "today" | "7d" | "30d" | "this_month" | "last_month" | "this_year" | "custom";
type Granularity = "daily" | "weekly" | "monthly";

export default function AdminFinancePage() {
  const queryClient = useQueryClient();
  const [datePreset, setDatePreset] = useState<DatePreset>("30d");
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"distributions" | "tax_ledger" | "inventory_valuation">("distributions");
  const [isExportingCsv, setIsExportingCsv] = useState(false);

  // Compute start_date and end_date strings based on preset
  const { startDateStr, endDateStr } = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    if (datePreset === "custom") {
      return {
        startDateStr: customStartDate || todayStr,
        endDateStr: customEndDate || todayStr,
      };
    }

    if (datePreset === "today") {
      return { startDateStr: todayStr, endDateStr: todayStr };
    }

    if (datePreset === "7d") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      return { startDateStr: past.toISOString().split("T")[0], endDateStr: todayStr };
    }

    if (datePreset === "30d") {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      return { startDateStr: past.toISOString().split("T")[0], endDateStr: todayStr };
    }

    if (datePreset === "this_month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDateStr: firstDay.toISOString().split("T")[0], endDateStr: todayStr };
    }

    if (datePreset === "last_month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDateStr: firstDay.toISOString().split("T")[0],
        endDateStr: lastDay.toISOString().split("T")[0],
      };
    }

    if (datePreset === "this_year") {
      const firstDay = new Date(now.getFullYear(), 0, 1);
      return { startDateStr: firstDay.toISOString().split("T")[0], endDateStr: todayStr };
    }

    return { startDateStr: todayStr, endDateStr: todayStr };
  }, [datePreset, customStartDate, customEndDate]);

  const queryParams = useMemo(
    () => ({
      start_date: startDateStr,
      end_date: endDateStr,
      granularity,
    }),
    [startDateStr, endDateStr, granularity]
  );

  // Queries
  const {
    data: summary,
    isLoading: isLoadingSummary,
    isFetching: isFetchingSummary,
    error: summaryError,
    refetch: refetchSummary,
  } = useFinanceSalesSummary(queryParams);

  const {
    data: chartData,
    isLoading: isLoadingChart,
    refetch: refetchChart,
  } = useFinanceSalesChart(queryParams);

  const {
    data: categoryBreakdown,
    isLoading: isLoadingCategory,
    refetch: refetchCategory,
  } = useFinanceRevenueByCategory(queryParams);

  const {
    data: brandBreakdown,
    isLoading: isLoadingBrand,
    refetch: refetchBrand,
  } = useFinanceRevenueByBrand(queryParams);

  const {
    data: taxReport,
    isLoading: isLoadingTax,
    refetch: refetchTax,
  } = useFinanceTaxReport({ start_date: startDateStr, end_date: endDateStr }, activeTab === "tax_ledger");

  const {
    data: inventoryValuation,
    isLoading: isLoadingValuation,
    refetch: refetchValuation,
  } = useFinanceInventoryValuation(activeTab === "inventory_valuation");

  const exportOrdersMutation = useExportOrdersMutation();

  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        refetchSummary(),
        refetchChart(),
        refetchCategory(),
        refetchBrand(),
        activeTab === "tax_ledger" ? refetchTax() : Promise.resolve(),
        activeTab === "inventory_valuation" ? refetchValuation() : Promise.resolve(),
      ]);
      toast.success("Financial telemetry refreshed");
    } catch {
      toast.error("Failed to refresh financial metrics");
    }
  };

  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    try {
      const blob = await exportOrdersMutation.mutateAsync({
        start_date: startDateStr,
        end_date: endDateStr,
        format: "csv",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `orders-financial-export-${startDateStr}-to-${endDateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Orders financial CSV export downloaded successfully");
    } catch (err: unknown) {
      toast.error("Failed to export orders CSV");
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Safe fallback values
  const grossRevenue = summary?.total_revenue ?? 0;
  const netRevenue = summary?.net_revenue ?? 0;
  const totalTax = summary?.total_tax ?? 0;
  const totalShipping = summary?.total_shipping ?? 0;
  const totalDiscounts = summary?.total_discounts ?? 0;
  const totalOrders = summary?.total_orders ?? 0;
  const aov = summary?.avg_order_value ?? 0;
  const totalItemsSold = summary?.total_items_sold ?? 0;
  const refundCount = summary?.refund_count ?? 0;
  const refundAmount = summary?.refund_amount ?? 0;

  // Chart data calculations
  const labels = chartData?.labels || [];
  const revenueSeries = chartData?.datasets?.[0]?.data || [];
  const ordersSeries = chartData?.datasets?.[1]?.data || [];
  const maxRevenue = Math.max(...revenueSeries, 1);

  // Category Total for % calculation
  const totalCategoryRevenue = useMemo(() => {
    if (!categoryBreakdown || categoryBreakdown.length === 0) return 0;
    return categoryBreakdown.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
  }, [categoryBreakdown]);

  // Brand Total for % calculation
  const totalBrandRevenue = useMemo(() => {
    if (!brandBreakdown || brandBreakdown.length === 0) return 0;
    return brandBreakdown.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
  }, [brandBreakdown]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. BREADCRUMB & HEADER */}
      <div className="space-y-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Admin Portal</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Financial Reporting & Accounting
          </span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
              <DollarSign className="h-4 w-4" />
              <span>AUTHORITATIVE FINANCIAL RECONCILIATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Finance & Accounting Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Gross revenue, net receipts, tax aggregation, discount utilization, refund adjustments, and inventory cost valuations.
            </p>
          </div>

          {/* Top Actions: Refresh & CSV Export */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={isFetchingSummary}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetchingSummary ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            <Can permission="report.view">
              <Button
                variant="success"
                size="sm"
                onClick={handleExportCsv}
                disabled={isExportingCsv}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
              >
                <Download className={`h-3.5 w-3.5 mr-1.5 ${isExportingCsv ? "animate-bounce" : ""}`} />
                {isExportingCsv ? "Exporting CSV..." : "Export Orders CSV"}
              </Button>
            </Can>
          </div>
        </div>
      </div>

      {/* 2. DATE FILTER & GRANULARITY BAR */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" /> Range:
          </span>
          {(
            [
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "this_month", label: "This Month" },
              { id: "last_month", label: "Last Month" },
              { id: "this_year", label: "This Year" },
              { id: "custom", label: "Custom" },
            ] as const
          ).map((preset) => (
            <button
              key={preset.id}
              onClick={() => setDatePreset(preset.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                datePreset === preset.id
                  ? "bg-slate-900 text-white font-semibold shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Range Inputs (if selected) or Granularity */}
        <div className="flex items-center gap-3 flex-wrap">
          {datePreset === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
              <span className="text-xs text-slate-400">to</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-8 text-xs w-36"
              />
            </div>
          )}

          {/* Granularity Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(["daily", "weekly", "monthly"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`px-2 py-0.5 rounded text-xs font-semibold capitalize transition-all ${
                  granularity === g
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. ACCOUNTING POLICY / TRUTH DISCLOSURE BANNER */}
      <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <span className="font-bold">Authoritative Ledger Notice:</span> Financial telemetry is directly aggregated from verified orders, settlement records, and tax calculations in the database. Profit margins are computed alongside the Inventory Cost Valuation ledger. Multi-currency distributions are maintained in their native settlement codes.
        </div>
      </div>

      {/* 4. FINANCIAL KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Revenue</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {isLoadingSummary ? "..." : formatCurrency(grossRevenue)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>{totalOrders} Orders</span>
              <span>AOV: {formatCurrency(aov)}</span>
            </div>
          </div>
        </div>

        {/* Net Revenue (Subtotal) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Sales</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {isLoadingSummary ? "..." : formatCurrency(netRevenue)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>Items: {totalItemsSold}</span>
              <span className="text-emerald-600 font-semibold">Excl. Tax/Ship</span>
            </div>
          </div>
        </div>

        {/* Tax Collected */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tax Collected</span>
            <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {isLoadingSummary ? "..." : formatCurrency(totalTax)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Regulatory remittance liability
            </div>
          </div>
        </div>

        {/* Shipping Revenue */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shipping</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {isLoadingSummary ? "..." : formatCurrency(totalShipping)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Fulfillment fee recoveries
            </div>
          </div>
        </div>

        {/* Total Discounts */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discounts</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {isLoadingSummary ? "..." : formatCurrency(totalDiscounts)}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Coupon / promotion credits
            </div>
          </div>
        </div>

        {/* Total Refunds */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Refunds</span>
            <div className={`p-1.5 rounded-lg ${refundCount > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400"}`}>
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {isLoadingSummary ? "..." : formatCurrency(refundAmount)}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>{refundCount} Refund claims</span>
              {refundAmount > 0 && <span className="text-rose-600 font-semibold">Processed</span>}
            </div>
          </div>
        </div>
      </div>

      {/* 5. REVENUE & SALES TREND CHART */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-slate-500" />
              Revenue & Order Volume Trend
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregated financial volume categorized by {granularity} intervals
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block" />
              <span className="font-semibold text-slate-700">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-500 inline-block" />
              <span className="font-semibold text-slate-700">Orders</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas / SVG Visualizer */}
        {isLoadingChart ? (
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg animate-pulse text-xs text-slate-400">
            Loading financial time series...
          </div>
        ) : labels.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-lg text-slate-400 p-4 text-center">
            <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
            <span className="text-sm font-semibold text-slate-700">No Sales Data for this Period</span>
            <span className="text-xs text-slate-500 mt-1 max-w-sm">
              No orders or transactions recorded between {startDateStr} and {endDateStr}.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-64 w-full flex items-end gap-2 pt-6 pb-2 px-2 border-b border-slate-200 overflow-x-auto">
              {labels.map((label, idx) => {
                const rev = revenueSeries[idx] ?? 0;
                const ord = ordersSeries[idx] ?? 0;
                const heightPct = Math.max(4, Math.round((rev / maxRevenue) * 100));

                return (
                  <div
                    key={label}
                    className="flex-1 min-w-[32px] flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip Hover Box */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-slate-900 text-white text-[11px] p-2 rounded shadow-lg z-10 whitespace-nowrap pointer-events-none">
                      <span className="font-bold text-slate-200">{label}</span>
                      <span className="text-emerald-400">Revenue: {formatCurrency(rev)}</span>
                      <span className="text-blue-400">Orders: {ord}</span>
                    </div>

                    {/* Bar visualization */}
                    <div className="w-full max-w-[28px] bg-slate-100 rounded-t-sm flex flex-col justify-end overflow-hidden h-full">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:opacity-85 transition-all rounded-t-sm"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 truncate w-full text-center">
                      {label.length > 5 ? label.slice(5) : label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 6. TABBED DETAILED ACCOUNTING SECTIONS */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-4 gap-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("distributions")}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "distributions"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <PieChartIcon className="h-4 w-4" />
            Revenue Distributions (Category & Brand)
          </button>
          <button
            onClick={() => setActiveTab("tax_ledger")}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "tax_ledger"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Tax Remittance Ledger
          </button>
          <button
            onClick={() => setActiveTab("inventory_valuation")}
            className={`pb-3 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "inventory_valuation"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-4 w-4" />
            Inventory Cost & Asset Valuation
          </button>
        </div>

        {/* Tab 1: Category & Brand Distributions */}
        {activeTab === "distributions" && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="rounded-xl border border-slate-200/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Revenue by Category</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Total: {formatCurrency(totalCategoryRevenue)}
                </span>
              </div>

              {isLoadingCategory ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : !categoryBreakdown || categoryBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No category sales recorded in this date range.
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.map((item) => {
                    const itemRev = Number(item.revenue || 0);
                    const pct = totalCategoryRevenue > 0 ? ((itemRev / totalCategoryRevenue) * 100).toFixed(1) : "0";

                    return (
                      <div key={item.id || item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500">{item.units_sold} units</span>
                            <span className="font-bold text-slate-900">{formatCurrency(itemRev)}</span>
                            <span className="text-[11px] font-semibold text-emerald-600 w-10 text-right">{pct}%</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-emerald-500 rounded-full transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Brand Breakdown */}
            <div className="rounded-xl border border-slate-200/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Revenue by Brand</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Total: {formatCurrency(totalBrandRevenue)}
                </span>
              </div>

              {isLoadingBrand ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : !brandBreakdown || brandBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No brand sales recorded in this date range.
                </div>
              ) : (
                <div className="space-y-4">
                  {brandBreakdown.map((item) => {
                    const itemRev = Number(item.revenue || 0);
                    const pct = totalBrandRevenue > 0 ? ((itemRev / totalBrandRevenue) * 100).toFixed(1) : "0";

                    return (
                      <div key={item.id || item.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500">{item.units_sold} units</span>
                            <span className="font-bold text-slate-900">{formatCurrency(itemRev)}</span>
                            <span className="text-[11px] font-semibold text-blue-600 w-10 text-right">{pct}%</span>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className="h-full bg-blue-500 rounded-full transition-all"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Tax Ledger */}
        {activeTab === "tax_ledger" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Tax Collection by Currency Ledger</h3>
                <p className="text-xs text-slate-500">
                  Summarized tax assessment and regulatory collections per active settlement currency.
                </p>
              </div>
            </div>

            {isLoadingTax ? (
              <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                Fetching tax remittance records...
              </div>
            ) : !taxReport || taxReport.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No taxable order records located for this date range.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Currency Code</th>
                      <th className="py-3 px-4 text-center">Taxable Orders</th>
                      <th className="py-3 px-4 text-right">Taxable Base Amount</th>
                      <th className="py-3 px-4 text-right">Tax Collected</th>
                      <th className="py-3 px-4 text-right">Effective Rate (Avg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {taxReport.map((row) => {
                      const base = Number(row.taxable_amount || 0);
                      const tax = Number(row.tax_collected || 0);
                      const effRate = base > 0 ? ((tax / base) * 100).toFixed(2) : "0.00";

                      return (
                        <tr key={row.currency_code} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                              {row.currency_code}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-700">
                            {row.total_taxable_orders}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-700">
                            {formatCurrency(base, row.currency_code)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-violet-700">
                            {formatCurrency(tax, row.currency_code)}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500 font-semibold">
                            {effRate}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Inventory Cost & Asset Valuation */}
        {activeTab === "inventory_valuation" && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Inventory Cost & Asset Valuation Ledger</h3>
                <p className="text-xs text-slate-500">
                  Real-time asset valuation calculated from product cost prices and on-hand warehouse physical units.
                </p>
              </div>
            </div>

            {isLoadingValuation ? (
              <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
                Computing inventory asset valuations...
              </div>
            ) : !inventoryValuation ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Unable to load inventory valuation ledger.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-xs text-slate-500 font-bold uppercase">Products in Stock</span>
                    <div className="text-xl font-bold text-slate-900 mt-1">
                      {inventoryValuation.summary.total_products} SKUs
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {inventoryValuation.summary.total_units_in_stock} physical units
                    </span>
                  </div>

                  <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg">
                    <span className="text-xs text-amber-700 font-bold uppercase">Total Cost Valuation</span>
                    <div className="text-xl font-bold text-amber-900 mt-1">
                      {formatCurrency(inventoryValuation.summary.total_cost_valuation)}
                    </div>
                    <span className="text-[11px] text-amber-600 mt-1 block">
                      Cost of Goods on Hand (COGS Asset)
                    </span>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-lg">
                    <span className="text-xs text-emerald-700 font-bold uppercase">Total Retail Valuation</span>
                    <div className="text-xl font-bold text-emerald-900 mt-1">
                      {formatCurrency(inventoryValuation.summary.total_retail_valuation)}
                    </div>
                    <span className="text-[11px] text-emerald-600 mt-1 block">
                      Potential gross retail realization
                    </span>
                  </div>

                  <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg">
                    <span className="text-xs text-blue-700 font-bold uppercase">Potential Gross Margin</span>
                    <div className="text-xl font-bold text-blue-900 mt-1">
                      {formatCurrency(inventoryValuation.summary.potential_profit)}
                    </div>
                    <span className="text-[11px] text-blue-600 mt-1 block">
                      Projected asset unrealized profit
                    </span>
                  </div>
                </div>

                {/* SKU Valuation Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] sticky top-0 bg-slate-50">
                      <tr>
                        <th className="py-3 px-4">SKU / Product</th>
                        <th className="py-3 px-4 text-right">Cost Price</th>
                        <th className="py-3 px-4 text-right">Retail Price</th>
                        <th className="py-3 px-4 text-center">On-Hand Qty</th>
                        <th className="py-3 px-4 text-right">Total Cost Value</th>
                        <th className="py-3 px-4 text-right">Total Retail Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {inventoryValuation.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-4">
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{item.sku}</div>
                          </td>
                          <td className="py-2.5 px-4 text-right text-slate-600">
                            {formatCurrency(Number(item.cost_price || 0))}
                          </td>
                          <td className="py-2.5 px-4 text-right text-slate-900 font-medium">
                            {formatCurrency(Number(item.base_price || 0))}
                          </td>
                          <td className="py-2.5 px-4 text-center font-bold text-slate-800">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium text-amber-700">
                            {formatCurrency(Number(item.total_cost_value || 0))}
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-emerald-700">
                            {formatCurrency(Number(item.total_retail_value || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
