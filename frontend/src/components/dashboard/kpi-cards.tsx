"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { DashboardSummary } from "@/services/dashboard-service";
import { TrendingUp, ShoppingCart, Users, Package, AlertCircle } from "lucide-react";

interface KpiCardsProps {
  summary?: DashboardSummary;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

export function KpiCards({ summary, isLoading, isError, onRetry }: KpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !summary) {
    return (
      <div className="rounded-[20px] border border-rose-200 bg-rose-50/40 p-6 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-700">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <span>Failed to load KPI metrics from backend API.</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-xs font-extrabold text-blue-600 hover:underline"
          >
            Retry Loading KPIs
          </button>
        )}
      </div>
    );
  }

  const { revenue, orders, customers, products } = summary;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue */}
      <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            TOTAL REVENUE
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
            {formatCurrency(revenue.total)}
          </span>
          <p className="text-xs font-semibold text-emerald-700">
            {formatCurrency(revenue.this_month)} earned this month
          </p>
        </div>
      </div>

      {/* Total Orders */}
      <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            TOTAL ORDERS
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100 shadow-2xs">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
            {orders.total.toLocaleString()}
          </span>
          <p className="text-xs font-medium text-slate-500">
            {orders.this_month.toLocaleString()} orders placed this month
          </p>
        </div>
      </div>

      {/* Active Customers */}
      <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            ACTIVE CUSTOMERS
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-2xs">
            <Users className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
            {customers.total.toLocaleString()}
          </span>
          <p className="text-xs font-semibold text-emerald-700">
            +{customers.new_this_month.toLocaleString()} new registered this month
          </p>
        </div>
      </div>

      {/* Catalog SKUs */}
      <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            CATALOG SKUS
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs">
            <Package className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
            {products.total.toLocaleString()}
          </span>
          <p className="text-xs font-medium text-slate-500">
            {products.active.toLocaleString()} active published items
          </p>
        </div>
      </div>
    </div>
  );
}
