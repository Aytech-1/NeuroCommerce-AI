"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Tag,
  Percent,
  DollarSign,
  Edit3,
  Calendar,
  CheckCircle2,
  XCircle,
  Users,
  ChevronRight,
  Sparkles,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useCoupon, useCouponUsage } from "@/hooks/use-coupons";

export default function CouponDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: coupon, isLoading, isError } = useCoupon(id);
  const { data: usageData } = useCouponUsage(id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Skeleton className="h-80 md:col-span-2 rounded-[20px]" />
          <Skeleton className="h-80 rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (isError || !coupon) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
          <Tag className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Coupon Not Found</h2>
        <p className="text-xs text-slate-500">The requested coupon record does not exist or has expired.</p>
        <Link href="/admin/coupons">
          <Button variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Back to Coupons
          </Button>
        </Link>
      </div>
    );
  }

  const renderDiscountValue = () => {
    if (coupon.type === "percentage") {
      return `${coupon.value}% OFF`;
    }
    if (coupon.type === "fixed_amount") {
      return `${formatCurrency(coupon.value)} OFF`;
    }
    if (coupon.type === "free_shipping") {
      return "Free Shipping";
    }
    return `${coupon.value}`;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB & HEADER                                                  */}
      {/* ======================================================================= */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
            Admin Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <Link href="/admin/coupons" className="hover:text-blue-600 transition-colors">
            Coupons
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold font-mono" aria-current="page">
            {coupon.code}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-sm border border-blue-100 shadow-2xs">
              <Tag className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
                COUPON INSPECTION
              </span>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                  {coupon.code}
                </h1>
                {coupon.is_active ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    <XCircle className="h-3 w-3" aria-hidden="true" />
                    <span>Inactive</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Campaign: {coupon.name} • Created on {formatDate(coupon.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/admin/coupons">
              <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold shadow-2xs">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </Button>
            </Link>
            <Link href={`/admin/coupons/${coupon.id}/edit`}>
              <Button size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-xs">
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                <span>Edit Coupon</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. DETAIL GRID                                                          */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Economics & Usage Logs */}
        <div className="space-y-6 md:col-span-2">
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Discount &amp; Rules</h2>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {coupon.type.replace("_", " ")}
              </span>
            </div>

            <div className="space-y-3.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">Discount Benefit:</span>
                <span className="font-extrabold text-base text-emerald-700">
                  {renderDiscountValue()}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium">Discount Type:</span>
                <span className="font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {coupon.type.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium">Minimum Order Amount:</span>
                <span className="font-extrabold text-slate-900">
                  {coupon.min_order_amount ? formatCurrency(coupon.min_order_amount) : "No minimum"}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium">Maximum Discount Cap:</span>
                <span className="font-extrabold text-slate-900">
                  {coupon.max_discount_amount ? formatCurrency(coupon.max_discount_amount) : "Uncapped"}
                </span>
              </div>
              {coupon.description && (
                <div className="pt-3">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                    Description / Internal Notes
                  </span>
                  <p className="text-slate-600 italic">{coupon.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Usage Redemption Log */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Customer Redemptions ({coupon.times_used})
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {coupon.usage_limit ? `${coupon.times_used} of ${coupon.usage_limit} used` : "Unlimited Quota"}
              </span>
            </div>

            {usageData?.data && usageData.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-4">Customer</th>
                      <th className="pb-3 pr-4">Order ID</th>
                      <th className="pb-3 pr-4 text-right">Discount Given</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usageData.data.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60">
                        <td className="py-3 pr-4 font-extrabold text-slate-900">
                          {log.user ? `${log.user.first_name} ${log.user.last_name}` : "Guest Customer"}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs text-slate-500">{log.order_id}</td>
                        <td className="py-3 pr-4 text-right font-extrabold text-xs text-emerald-700">
                          -{formatCurrency(log.discount_amount)}
                        </td>
                        <td className="py-3 text-right text-xs text-slate-500 font-medium">
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No redemptions logged for this coupon yet.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Limits & Scheduling */}
        <div className="space-y-6">
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Quota &amp; Schedule</h2>
            </div>

            <div className="space-y-3.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">Total Usage Limit:</span>
                <span className="font-extrabold text-slate-900">
                  {coupon.usage_limit ?? "Unlimited"}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium">Per-Customer Limit:</span>
                <span className="font-extrabold text-slate-900">
                  {coupon.usage_limit_per_user ?? "Unlimited"}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" aria-hidden="true" /> Valid From:
                </span>
                <span className="font-semibold text-slate-700">
                  {coupon.starts_at ? formatDate(coupon.starts_at) : "Immediate"}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" aria-hidden="true" /> Valid Until:
                </span>
                <span className="font-semibold text-slate-700">
                  {coupon.expires_at ? formatDate(coupon.expires_at) : "Never Expiring"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
