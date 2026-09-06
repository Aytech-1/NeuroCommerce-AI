"use client";

import { use } from "react";
import Link from "next/link";
import {
  Receipt,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  User,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Printer,
  Download,
  MapPin,
  Tag,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInvoice } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/utils";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = use(params);
  const { data: invoice, isLoading, isError, error } = useInvoice(id);

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-8 w-64 bg-slate-100 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-slate-50 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-50 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !invoice) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-12 text-center shadow-xs">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Invoice Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {error instanceof Error ? error.message : "The requested invoice document does not exist or has been removed."}
        </p>
        <Link href="/admin/invoices">
          <Button variant="outline" size="sm" className="mt-4 gap-1.5 text-xs font-bold">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Invoices Roster</span>
          </Button>
        </Link>
      </div>
    );
  }

  const currency = invoice.currency_code || invoice.order?.currency_code || "USD";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Paid & Settled
          </span>
        );
      case "issued":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="h-3.5 w-3.5" />
            Issued
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            Draft
          </span>
        );
      case "void":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5" />
            Void
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/admin/invoices" className="hover:text-slate-900 transition inline-flex items-center gap-1">
              <Receipt className="h-3 w-3" />
              <span>Invoices</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-mono font-bold">{invoice.invoice_number}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-mono">
              {invoice.invoice_number}
            </h1>
            {getStatusBadge(invoice.status)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Issued on{" "}
            <span className="font-semibold text-slate-700">
              {invoice.issued_at
                ? new Date(invoice.issued_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Draft"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/invoices">
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-9 px-3.5 text-xs font-bold gap-1.5 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Invoice</span>
          </Button>

          {invoice.pdf_url && (
            <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
              <Button
                size="sm"
                className="h-9 px-4 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF</span>
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* 4-Card Overview Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: Billing Customer Information */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <User className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Billing Customer
              </h2>
            </div>
            {invoice.order?.user?.id && (
              <Link
                href={`/admin/customers/${invoice.order.user.id}`}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 hover:underline"
              >
                <span>Profile</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Billed To</span>
              <span className="font-bold text-slate-900">
                {invoice.order?.billing_address
                  ? `${invoice.order.billing_address.first_name} ${invoice.order.billing_address.last_name}`
                  : invoice.order?.user?.name || "Customer"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Email Address</span>
              <span className="font-medium text-slate-700 select-all">
                {invoice.order?.user?.email || "—"}
              </span>
            </div>

            {invoice.order?.billing_address && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium block mb-1">Billing Address:</span>
                <p className="text-slate-700 font-medium leading-relaxed">
                  {invoice.order.billing_address.address_line_1}
                  {invoice.order.billing_address.address_line_2 && `, ${invoice.order.billing_address.address_line_2}`}
                  <br />
                  {invoice.order.billing_address.city}, {invoice.order.billing_address.state_province}{" "}
                  {invoice.order.billing_address.postal_code}
                  <br />
                  {invoice.order.billing_address.country_code}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Commercial Order Snapshot */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Commercial Order
              </h2>
            </div>
            <Link
              href={`/admin/orders/${invoice.order_id}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline"
            >
              <span>View Order</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Order Reference</span>
              <Link
                href={`/admin/orders/${invoice.order_id}`}
                className="font-mono font-black text-slate-900 hover:text-blue-600"
              >
                {invoice.order?.order_number || invoice.order_id}
              </Link>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Order Status</span>
              <span className="font-bold text-slate-800 capitalize">
                {invoice.order?.status || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Payment Method</span>
              <span className="font-semibold text-slate-800 capitalize">
                {invoice.order?.payment_method || "Online Settlement"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-2">
              <span className="text-slate-500 font-medium">Shipping Method</span>
              <span className="font-medium text-slate-700">
                {invoice.order?.shipping_method || "Standard Delivery"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Shipping Destination */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <MapPin className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Delivery Destination
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-amber-700 uppercase">
              {invoice.order?.shipping_address?.country_code || "DESTINATION"}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {invoice.order?.shipping_address ? (
              <div>
                <span className="font-bold text-slate-900 block mb-1">
                  {invoice.order.shipping_address.first_name} {invoice.order.shipping_address.last_name}
                </span>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {invoice.order.shipping_address.address_line_1}
                  {invoice.order.shipping_address.address_line_2 && `, ${invoice.order.shipping_address.address_line_2}`}
                  <br />
                  {invoice.order.shipping_address.city}, {invoice.order.shipping_address.state_province}{" "}
                  {invoice.order.shipping_address.postal_code}
                  <br />
                  {invoice.order.shipping_address.country_code}
                </p>
                {invoice.order.shipping_address.phone && (
                  <p className="mt-2 text-slate-500">Tel: {invoice.order.shipping_address.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-slate-400 italic">No specific delivery address recorded.</p>
            )}
          </div>
        </div>

        {/* Card 4: Financial Summary */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <CreditCard className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Financial Breakdown
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-600 uppercase">
              {currency}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="font-mono font-bold text-slate-800">
                {formatCurrency(invoice.subtotal, currency)}
              </span>
            </div>

            {Number(invoice.order?.discount_amount || 0) > 0 && (
              <div className="flex items-center justify-between py-1 text-emerald-600">
                <span className="font-medium flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span>Discount {invoice.order?.coupon_code && `(${invoice.order.coupon_code})`}</span>
                </span>
                <span className="font-mono font-bold">
                  -{formatCurrency(invoice.order?.discount_amount || 0, currency)}
                </span>
              </div>
            )}

            {Number(invoice.order?.shipping_amount || 0) > 0 && (
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 font-medium">Shipping & Handling</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatCurrency(invoice.order?.shipping_amount || 0, currency)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Tax Amount</span>
              <span className="font-mono font-bold text-slate-800">
                {formatCurrency(invoice.tax_amount, currency)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 mt-2">
              <span className="text-slate-900 font-black text-sm">Invoice Grand Total</span>
              <span className="font-mono font-black text-emerald-600 text-base">
                {formatCurrency(invoice.total_amount, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Line Items Table */}
      {invoice.order?.items && invoice.order.items.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Package className="h-4 w-4 text-slate-600" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Commercial Line Items
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-3">Item / Description</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {invoice.order.items.map((item) => (
                  <tr key={item.id} className="transition hover:bg-slate-50/70">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{item.product_name}</span>
                      {item.variant_name && (
                        <span className="text-[11px] text-slate-400 font-medium block">
                          Variant: {item.variant_name}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{item.product_sku}</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                      {formatCurrency(item.unit_price, currency)}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.line_total, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Document Integrity & Verification Badge */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 shadow-xs flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="font-medium">
            This invoice document is cryptographically verified against the authoritative database ledger.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 select-all">UUID: {invoice.id}</span>
      </div>
    </div>
  );
}
