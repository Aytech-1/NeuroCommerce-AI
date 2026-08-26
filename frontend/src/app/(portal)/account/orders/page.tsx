"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Filter,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  AlertCircle,
  Package,
  Calendar,
  Layers,
  X,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerOrders } from "@/hooks/use-customer";
import { formatCurrency, formatDate } from "@/lib/utils";

const statusFilterOptions = [
  { label: "All Orders", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

export default function CustomerOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const { data, isLoading, isError, refetch } = useCustomerOrders({
    page,
    per_page: 10,
    status: statusFilter || undefined,
  });

  const rawOrders = data?.data || [];

  // Filter by search query client-side over currently loaded batch
  const orders = useMemo(() => {
    let result = [...rawOrders];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((o) => o.order_number?.toLowerCase().includes(q));
    }
    if (sortOrder === "oldest") {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return result;
  }, [rawOrders, searchQuery, sortOrder]);

  // Aggregate Metrics (calculated safely from authoritative metadata / loaded set)
  const totalOrdersCount = data?.meta?.total ?? rawOrders.length;
  const activeOrdersCount = rawOrders.filter(
    (o) => o.status === "pending" || o.status === "paid" || o.status === "processing" || o.status === "shipped"
  ).length;
  const deliveredCount = rawOrders.filter(
    (o) => o.status === "delivered"
  ).length;

  const hasActiveFilters = searchQuery.trim().length > 0 || statusFilter.length > 0;

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setPage(1);
  };

  const getStatusBadge = (status: string, statusLabel?: string) => {
    const s = status.toLowerCase();
    const label = statusLabel || status;

    if (s === "delivered" || s === "completed") {
      return (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    }
    if (s === "shipped") {
      return (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
          <Truck className="h-3 w-3" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    }
    if (s === "processing") {
      return (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    }
    if (s === "paid") {
      return (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
          <CreditCard className="h-3 w-3" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    }
    if (s === "cancelled" || s === "refunded") {
      return (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          <span>{label}</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
        <span>{label}</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB                                                           */}
      {/* ======================================================================= */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/account" className="hover:text-blue-600 transition-colors">
          My Account
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="text-slate-900 font-bold" aria-current="page">
          Orders
        </span>
      </nav>

      {/* ======================================================================= */}
      {/* 2. PAGE HEADER                                                          */}
      {/* ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
            YOUR ORDERS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Order History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View, track, and manage your NeuroCommerce hardware purchases.
          </p>
        </div>

        <Link
          href="/products"
          className="h-11 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors self-start sm:self-auto"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {/* ======================================================================= */}
      {/* 3. ORDER STATISTICS                                                     */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block">Total Orders</span>
              <span className="text-xl font-extrabold text-slate-900 block">
                {isLoading ? "..." : totalOrdersCount}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">All hardware &amp; telemetry purchases</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Truck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block">Active Orders</span>
              <span className="text-xl font-extrabold text-slate-900 block">
                {isLoading ? "..." : activeOrdersCount}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Currently in transit or processing</p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block">Completed</span>
              <span className="text-xl font-extrabold text-slate-900 block">
                {isLoading ? "..." : deliveredCount}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Successfully delivered to laboratory</p>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4. SEARCH / FILTER / SORT TOOLBAR                                       */}
      {/* ======================================================================= */}
      <div className="space-y-3 p-4 sm:p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #..."
              aria-label="Search by order number"
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear search query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="order-sort-select" className="text-xs font-bold text-slate-500">
              Sort:
            </label>
            <select
              id="order-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Status:</span>
          {statusFilterOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(1);
              }}
              className={`h-9 px-3 rounded-xl text-xs font-bold transition-all ${
                statusFilter === opt.value
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-9 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors ml-auto inline-flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 5. ORDER RESULTS                                                        */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64" />
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 text-center rounded-[20px] bg-white border border-rose-200 shadow-xs space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">Unable to load your orders</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Something went wrong while retrieving your order history.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="h-11 px-5 inline-flex items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <Link
              href="/products"
              className="h-11 px-5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all space-y-4"
              >
                {/* Order Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      {order.order_number}
                    </span>
                    {getStatusBadge(order.status, order.status_label)}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>Placed on {formatDate(order.created_at)}</span>
                  </div>
                </div>

                {/* Order Details & Financial Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-700 block">
                      Hardware Equipment ({order.item_count ?? 1} item{order.item_count === 1 ? "" : "s"})
                    </span>
                    <p className="text-xs text-slate-500">
                      Calibrated clinical neuroscience package with ESD-safe certified fulfillment.
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Total Amount
                      </span>
                      <span className="text-base sm:text-lg font-extrabold text-slate-900">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>

                    <Link
                      href={`/account/orders/${order.id}`}
                      className="h-11 px-5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors shrink-0"
                    >
                      <span>View Order</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.total > (data.meta.per_page || 10) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500">
                Showing {((data.meta.current_page - 1) * (data.meta.per_page || 10)) + 1}–
                {Math.min(data.meta.current_page * (data.meta.per_page || 10), data.meta.total)} of {data.meta.total} orders
              </span>
              <Pagination
                currentPage={data.meta.current_page}
                totalPages={data.meta.last_page || Math.ceil(data.meta.total / (data.meta.per_page || 10))}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      ) : hasActiveFilters ? (
        /* Search / Filter Empty State */
        <div className="p-8 sm:p-12 text-center rounded-[20px] bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
            <Search className="h-8 w-8" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">No orders found</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Try a different order number or clear your filters.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-11 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <span>Clear Search &amp; Filters</span>
            </button>
          </div>
        </div>
      ) : (
        /* General Zero Orders Empty State */
        <div className="p-8 sm:p-12 text-center rounded-[20px] bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
            <Package className="h-8 w-8" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">No orders yet</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Your NeuroCommerce purchases will appear here once you place your first order.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/products"
              className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
