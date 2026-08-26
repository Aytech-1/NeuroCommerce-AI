"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RecentOrder } from "@/services/dashboard-service";
import { ShoppingCart, ArrowRight } from "lucide-react";

interface RecentOrdersTableProps {
  orders?: RecentOrder[];
  isLoading: boolean;
  isError: boolean;
}

export function RecentOrdersTable({ orders = [], isLoading, isError }: RecentOrdersTableProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || orders.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-center items-center text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
          <ShoppingCart className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">
            {isError ? "Unable to load recent orders" : "No recent orders"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isError ? "Order service endpoint failed to respond." : "New orders placed in the store will appear here in real time."}
          </p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return (
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Delivered
          </span>
        );
      case "processing":
      case "confirmed":
        return (
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Processing
          </span>
        );
      case "shipped":
        return (
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
            Shipped
          </span>
        );
      case "pending":
        return (
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
      case "cancelled":
      case "refunded":
        return (
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-[20px] bg-white border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Recent Orders Stream
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Live commercial telemetry from laboratory customer checkouts
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>View All Orders</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* Responsive Table / Card Stream */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
              <th className="pb-3 pr-4">Order #</th>
              <th className="pb-3 pr-4">Customer</th>
              <th className="pb-3 pr-4">Items</th>
              <th className="pb-3 pr-4">Total</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4 text-right">Date</th>
              <th className="pb-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => {
              const customerName = order.user
                ? `${order.user.first_name || ""} ${order.user.last_name || ""}`.trim() || order.user.email
                : "Laboratory Customer";
              const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || order.items?.length || 1;

              return (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 pr-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono font-extrabold text-blue-600 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="font-extrabold text-slate-900 block">
                      {customerName}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                      {order.user?.email || ""}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-600 font-medium">
                    {itemCount} item{itemCount !== 1 ? "s" : ""}
                  </td>
                  <td className="py-3.5 pr-4 font-extrabold text-slate-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="py-3.5 pr-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-3.5 pr-4 text-right text-slate-400 font-medium text-[11px]">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center justify-center px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
