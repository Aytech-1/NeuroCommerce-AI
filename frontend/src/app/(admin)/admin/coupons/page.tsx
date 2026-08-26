"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Tag,
  Percent,
  DollarSign,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Filter,
  AlertCircle,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Can } from "@/components/ui/can";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useCoupons, useDeleteCoupon } from "@/hooks/use-coupons";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [isActive, setIsActive] = useState<string>("");
  const [couponToDelete, setCouponToDelete] = useState<{ id: string; code: string } | null>(null);

  const { data, isLoading, isError, refetch } = useCoupons({
    page,
    per_page: 15,
    search: search.trim() || undefined,
    type: type || undefined,
    is_active: isActive !== "" ? isActive : undefined,
  });

  const deleteMutation = useDeleteCoupon();

  const handleDelete = (id: string, code: string) => {
    setCouponToDelete({ id, code });
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;
    try {
      await deleteMutation.mutateAsync(couponToDelete.id);
      toast.success("Coupon deleted successfully.");
      setCouponToDelete(null);
    } catch {
      toast.error("Failed to delete coupon.");
    }
  };

  const renderDiscountValue = (couponType: string, value: number) => {
    if (couponType === "percentage") {
      return `${value}% OFF`;
    }
    if (couponType === "fixed_amount") {
      return `${formatCurrency(value)} OFF`;
    }
    if (couponType === "free_shipping") {
      return "Free Shipping";
    }
    return `${value}`;
  };

  const totalCoupons = data?.meta?.total ?? data?.data?.length ?? 0;
  const activeCoupons = data?.data?.filter((c) => c.is_active).length ?? 0;
  const totalRedemptions = data?.data?.reduce((acc, c) => acc + (c.times_used || 0), 0) ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB & HEADER                                                  */}
      {/* ======================================================================= */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
            Admin Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Coupons
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              PROMOTION MANAGEMENT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Coupons &amp; Promotions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create, monitor, and manage promotional discount codes across the NeuroCommerce storefront.
            </p>
          </div>

          <Can permission="coupon.create">
            <Link href="/admin/coupons/create">
              <Button className="h-10 px-4 gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-xs">
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Create Coupon</span>
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. PROMOTION KPI SUMMARY ROW                                            */}
      {/* ======================================================================= */}
      {data?.data && data.data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Coupons
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalCoupons} Coupons
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Campaigns
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {activeCoupons} Active
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Redemptions
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {totalRedemptions} Uses
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Discount Control
            </span>
            <span className="text-xs font-extrabold text-emerald-700 mt-2 block">
              Live &amp; Synchronized
            </span>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. FILTER TOOLBAR                                                       */}
      {/* ======================================================================= */}
      <div className="p-4 sm:p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by code or promo name..."
              prefixIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
              <Filter className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Filters:</span>
            </div>

            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Discount Types</option>
              <option value="percentage">Percentage Discount</option>
              <option value="fixed_amount">Fixed Amount</option>
              <option value="free_shipping">Free Shipping</option>
              <option value="buy_x_get_y">Buy X Get Y</option>
            </select>

            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Statuses</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>

            {(search || type || isActive !== "") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setType("");
                  setIsActive("");
                  setPage(1);
                }}
                className="h-10 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4. COUPONS TABLE                                                        */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-rose-200 shadow-2xs text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Failed to load coupons directory</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to communicate with the promotion engine.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Retry Loading
          </Button>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="rounded-[20px] bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="py-3.5 px-6">Coupon / Campaign</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Usage / Limit</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Valid Until</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold border border-blue-100 shadow-2xs">
                          {coupon.type === "percentage" ? (
                            <Percent className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Tag className="h-4 w-4" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/coupons/${coupon.id}`}
                            className="inline-block font-mono font-extrabold text-xs text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200/80 transition-colors"
                          >
                            {coupon.code}
                          </Link>
                          <span className="text-[11px] text-slate-600 font-semibold block truncate mt-0.5">
                            {coupon.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-xs text-emerald-700">
                      {renderDiscountValue(coupon.type, coupon.value)}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      <span>{coupon.times_used}</span>
                      <span className="text-slate-400"> / {coupon.usage_limit ?? "∞"}</span>
                    </td>
                    <td className="py-3.5 px-4">
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
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                      {coupon.expires_at ? formatDate(coupon.expires_at) : "No Expiry"}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/coupons/${coupon.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>View</span>
                          </Button>
                        </Link>
                        <Link href={`/admin/coupons/${coupon.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Edit</span>
                          </Button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          aria-label={`Delete coupon ${coupon.code}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {data.meta && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/30">
              <Pagination
                currentPage={data.meta.current_page}
                totalPages={data.meta.last_page || Math.ceil(data.meta.total / (data.meta.per_page || 15))}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Tag}
          title="No Coupons Configured"
          description="Create discount vouchers and seasonal marketing coupon codes."
          actionLabel="Create Coupon"
          onAction={() => {
            window.location.href = "/admin/coupons/create";
          }}
        />
      )}

      <ConfirmDialog
        open={!!couponToDelete}
        onOpenChange={(open) => {
          if (!open) setCouponToDelete(null);
        }}
        title="Delete this coupon?"
        description={`Are you sure you want to delete coupon "${couponToDelete?.code}"? This discount code will be permanently deactivated.`}
        confirmText="Delete Coupon"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
