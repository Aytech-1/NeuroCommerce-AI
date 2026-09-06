"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ChevronRight,
  AlertCircle,
  DollarSign,
  ShieldCheck,
  Building2,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import { usePayments } from "@/hooks/use-payments";

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [gateway, setGateway] = useState<string>("");

  const { data, isLoading, isError, refetch } = usePayments({
    page,
    per_page: 15,
    search: search.trim() || undefined,
    status: status || undefined,
    gateway: gateway || undefined,
  });

  const getStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            <span>Completed</span>
          </span>
        );
      case "processing":
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{paymentStatus.toUpperCase()}</span>
          </span>
        );
      case "refunded":
      case "partially_refunded":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>{paymentStatus.replace("_", " ").toUpperCase()}</span>
          </span>
        );
      case "failed":
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" aria-hidden="true" />
            <span>{paymentStatus.toUpperCase()}</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {paymentStatus}
          </span>
        );
    }
  };

  const getGatewayBadge = (gw: string) => {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 uppercase">
        {gw}
      </span>
    );
  };

  const totalPayments = data?.meta?.total ?? data?.data?.length ?? 0;
  const completedAmount =
    data?.data
      ?.filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;
  const refundedCount =
    data?.data?.filter((p) => p.status === "refunded" || p.status === "partially_refunded").length ?? 0;

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
            Payments
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              FINANCIAL OPERATIONS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Payments & Transactions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Audit payment authorizations, gateway settlements, and transaction histories.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. METRICS OVERVIEW                                                     */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Records</span>
            <CreditCard className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black tracking-tight text-slate-900">{totalPayments}</p>
          <p className="text-[11px] text-slate-400 font-medium">Logged payment transactions</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Processed Total</span>
            <DollarSign className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black tracking-tight text-emerald-700">
            {formatCurrency(completedAmount)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">Settled payments in view</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Refunds Processed</span>
            <RotateCcw className="h-4 w-4 text-purple-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black tracking-tight text-purple-700">{refundedCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">Refunded or reversed payments</p>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3. SEARCH & FILTER BAR                                                  */}
      {/* ======================================================================= */}
      <div className="p-4 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input
              type="text"
              placeholder="Search by Payment ID, Gateway Ref..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-10 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={gateway}
              onChange={(e) => {
                setGateway(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Gateways</option>
              <option value="paystack">Paystack</option>
              <option value="flutterwave">Flutterwave</option>
              <option value="stripe">Stripe</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>

            {(search || status || gateway) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setGateway("");
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
      {/* 4. PAYMENTS TABLE                                                       */}
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
          <h3 className="text-base font-extrabold text-slate-900">Failed to load payment records</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to communicate with the payment management service.
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
                  <th className="py-3.5 px-6">Payment Reference</th>
                  <th className="py-3.5 px-4">Gateway / Method</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/payments/${payment.id}`}
                          className="font-mono font-extrabold text-xs text-blue-700 hover:text-blue-800 transition-colors block"
                        >
                          {payment.gateway_payment_id || payment.id.substring(0, 18)}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-medium block truncate mt-0.5">
                          ID: {payment.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {getGatewayBadge(payment.gateway)}
                        {payment.card_brand && (
                          <span className="text-[11px] text-slate-500 block">
                            {payment.card_brand} {payment.card_last_four ? `•••• ${payment.card_last_four}` : ""}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-xs text-slate-900">
                      {formatCurrency(payment.amount, payment.currency_code)}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(payment.status)}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                      {payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link href={`/admin/payments/${payment.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>View</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
          icon={CreditCard}
          title="No Payment Records Found"
          description="Payment settlements and transaction records will appear here as orders are placed."
        />
      )}
    </div>
  );
}