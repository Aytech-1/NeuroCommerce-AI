"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { LowStockItem } from "@/services/dashboard-service";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

interface LowStockWidgetProps {
  items?: LowStockItem[];
  isLoading: boolean;
  isError: boolean;
}

export function LowStockWidget({ items = [], isLoading, isError }: LowStockWidgetProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4 h-full">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 rounded-[20px] bg-white border border-rose-200 shadow-2xs flex flex-col justify-center items-center text-center h-full space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900">Unable to check stock alerts</h3>
        <p className="text-xs text-slate-500 max-w-xs">Backend inventory telemetry service is currently unreachable.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-8 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-center items-center text-center h-full space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto">
          <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900">All Inventory Healthy</h3>
        <p className="text-xs text-slate-500 max-w-xs">Zero products currently below the low-stock safety threshold.</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between h-full space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
          <h2 className="text-base font-extrabold text-slate-900">
            Low Stock Alerts
          </h2>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>Manage Stock</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 flex-1">
        {items.map((item) => {
          const isOutOfStock = item.stock_quantity === 0 || item.stock_status === "out_of_stock";

          return (
            <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="min-w-0 pr-3 space-y-0.5">
                <span className="text-xs font-extrabold text-slate-900 truncate block">
                  {item.name}
                </span>
                <span className="text-[11px] font-mono text-slate-500 block truncate">
                  SKU: {item.sku || "N/A"} • {item.category?.name || "Hardware"}
                </span>
              </div>

              <div className="shrink-0">
                {isOutOfStock ? (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                    Out of Stock
                  </span>
                ) : (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {item.stock_quantity} left
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
