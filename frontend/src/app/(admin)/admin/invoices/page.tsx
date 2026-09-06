"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Receipt,
  CreditCard,
  User,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInvoices } from "@/hooks/use-invoices";
import { InvoiceItem } from "@/services/invoice-service";
import { formatCurrency } from "@/lib/utils";

export default function AdminInvoicesPage() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");

  const queryParams = {
    page,
    per_page: perPage,
    status: statusFilter !== "all" ? statusFilter : undefined,
    currency_code: currencyFilter !== "all" ? currencyFilter : undefined,
    search: search.trim() ? search.trim() : undefined,
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useInvoices(queryParams);

  const invoices = data?.data || [];

  // Derived KPIs from real API data
  const totalCount = data?.meta?.total ?? invoices.length;
  const paidCount = invoices.filter((inv: InvoiceItem) => inv.status === "paid").length;
  const pendingCount = invoices.filter((inv: InvoiceItem) => inv.status === "issued" || inv.status === "draft").length;
  const totalInvoicedSum = invoices.reduce((sum: number, inv: InvoiceItem) => sum + Number(inv.total_amount || 0), 0);

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            Paid
          </span>
        );
      case "issued":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="h-3 w-3" />
            Issued
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" />
            Draft
          </span>
        );
      case "void":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" />
            Void
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600">
            <Receipt className="h-3.5 w-3.5" />
            <span>Commercial Billing & Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Invoices & Documents
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Authoritative legal tax invoices, commercial receipts, and transaction documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs font-semibold text-slate-700 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-emerald-600" : ""}`} />
            <span>{isFetching ? "Syncing..." : "Sync Invoices"}</span>
          </Button>
        </div>
      </div>

      {/* Real Metric Highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Invoices</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{totalCount}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">Issued commercial documents</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Invoiced Value</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600 tracking-tight">
              {formatCurrency(totalInvoicedSum, invoices[0]?.currency_code || "NGN")}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">Gross billing total</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Paid Invoices</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{paidCount}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">Settled billing records</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending / Issued</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-600 tracking-tight">{pendingCount}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">Awaiting settlement</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by Invoice #, Order #, or Customer..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-10 pl-9.5 text-xs bg-slate-50 border-slate-200 focus:bg-white transition"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 focus:bg-white focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="issued">Issued</option>
                <option value="draft">Draft</option>
                <option value="void">Void</option>
              </select>
            </div>

            {/* Currency Filter */}
            <div className="flex items-center gap-2">
              <select
                value={currencyFilter}
                onChange={(e) => {
                  setCurrencyFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 focus:bg-white focus:outline-hidden"
              >
                <option value="all">All Currencies</option>
                <option value="NGN">NGN (₦)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          {(search || statusFilter !== "all" || currencyFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setCurrencyFilter("all");
                setPage(1);
              }}
              className="h-9 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Invoices Roster Table */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="h-6 w-48 bg-slate-100 rounded-md animate-pulse" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center shadow-xs">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
          <h3 className="text-base font-bold text-slate-900">Failed to Load Invoices</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {error instanceof Error ? error.message : "An unexpected communication error occurred with the server."}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 h-8 px-4 text-xs font-bold border-rose-200 text-rose-700 hover:bg-rose-100"
          >
            Retry Sync
          </Button>
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Invoices Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "all" || currencyFilter !== "all"
              ? "No commercial invoices matching the current filter parameters were found."
              : "No commercial invoices have been issued or generated yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Tax Amount</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Issued At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {invoices.map((invoice: InvoiceItem) => {
                  const currency = invoice.currency_code || "USD";
                  return (
                    <tr key={invoice.id} className="transition hover:bg-slate-50/70">
                      {/* Invoice Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <Link
                          href={`/admin/invoices/${invoice.id}`}
                          className="hover:text-emerald-600 hover:underline inline-flex items-center gap-1.5"
                        >
                          <Receipt className="h-3.5 w-3.5 text-slate-400" />
                          <span>{invoice.invoice_number}</span>
                        </Link>
                      </td>

                      {/* Linked Order */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/orders/${invoice.order_id}`}
                          className="inline-flex items-center gap-1 text-slate-900 font-bold hover:text-emerald-600 transition"
                        >
                          <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                          <span>{invoice.order?.order_number || invoice.order_id.substring(0, 8)}</span>
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <div className="truncate max-w-[150px]">
                            <span className="font-semibold text-slate-900 block truncate">
                              {invoice.order?.user?.name || "Customer"}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {invoice.order?.user?.email || "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {formatCurrency(invoice.subtotal, currency)}
                      </td>

                      {/* Tax */}
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {formatCurrency(invoice.tax_amount, currency)}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                        {formatCurrency(invoice.total_amount, currency)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(invoice.status)}</td>

                      {/* Issued At */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {invoice.issued_at
                          ? new Date(invoice.issued_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Draft"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/admin/invoices/${invoice.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                            title="Inspect Invoice 360"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Inspect Details</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {data?.meta && (data.meta.last_page ?? 1) > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-500 font-medium">
                Showing Page <span className="font-bold text-slate-900">{data.meta.current_page}</span> of{" "}
                <span className="font-bold text-slate-900">{data.meta.last_page ?? 1}</span> ({data.meta.total} records)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={(data.meta.current_page ?? 1) <= 1}
                  className="h-8 px-3 rounded-lg text-xs font-bold gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.meta?.last_page ?? 1, p + 1))}
                  disabled={(data.meta.current_page ?? 1) >= (data.meta.last_page ?? 1)}
                  className="h-8 px-3 rounded-lg text-xs font-bold gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
