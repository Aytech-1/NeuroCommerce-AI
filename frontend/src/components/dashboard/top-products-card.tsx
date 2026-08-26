"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { TopProduct } from "@/services/dashboard-service";
import { Trophy, Package, ArrowRight } from "lucide-react";

interface TopProductsCardProps {
  products?: TopProduct[];
  isLoading: boolean;
  isError: boolean;
}

export function TopProductsCard({ products = [], isLoading, isError }: TopProductsCardProps) {
  if (isLoading) {
    return (
      <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4 h-full">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || products.length === 0) {
    return (
      <div className="p-8 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-center items-center text-center h-full space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mx-auto">
          <Package className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900">
          {isError ? "Unable to load top products" : "No top products yet"}
        </h3>
        <p className="text-xs text-slate-500 max-w-xs">
          {isError ? "Backend product analytics service is currently unreachable." : "Products will appear once customer orders are placed."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between h-full space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" aria-hidden="true" />
          <h2 className="text-base font-extrabold text-slate-900">
            Top Performing Products
          </h2>
        </div>
        <Link
          href="/admin/products"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 flex-1">
        {products.map((product, idx) => (
          <div key={product.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-extrabold text-slate-700 font-mono">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/admin/products`}
                  className="text-xs font-extrabold text-slate-900 hover:text-blue-600 truncate block transition-colors"
                >
                  {product.name}
                </Link>
                <span className="text-[11px] text-slate-500 font-medium block truncate">
                  {product.category?.name || "Neural Hardware"} • {formatCurrency(product.price)}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-extrabold text-slate-900 block">
                {product.total_sold}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                units sold
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
