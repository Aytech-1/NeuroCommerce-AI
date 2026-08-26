"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Package,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Printer,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  Building,
  FileText,
  HelpCircle,
  XCircle,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCustomerOrder, useCancelCustomerOrder } from "@/hooks/use-customer";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TimelineStep {
  id: string;
  label: string;
  description: string;
}

const standardSteps: TimelineStep[] = [
  { id: "placed", label: "Order Placed", description: "Order recorded in laboratory system" },
  { id: "payment", label: "Payment Confirmed", description: "Authorization & invoice verified" },
  { id: "processing", label: "Processing & QA", description: "Hardware calibration and packaging" },
  { id: "shipped", label: "Dispatched", description: "Carrier handover & ESD tracking active" },
  { id: "delivered", label: "Delivered", description: "Laboratory receipt confirmed" },
];

export default function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading, isError, refetch } = useCustomerOrder(id);
  const cancelOrderMutation = useCancelCustomerOrder();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const handleCancelSubmit = () => {
    if (!cancelReason.trim()) return;
    cancelOrderMutation.mutate(
      { id, reason: cancelReason.trim() },
      {
        onSuccess: () => {
          setCancelDialogOpen(false);
          setCancelReason("");
        },
      }
    );
  };

  const handlePrintReceipt = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-5xl">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 rounded-[20px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-[20px]" />
          <Skeleton className="h-96 rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-[20px] bg-white border border-slate-200/90 shadow-xs max-w-xl mx-auto space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-slate-900">Order Not Found</h2>
          <p className="text-xs text-slate-500">
            We could not retrieve the requested order. It may have been relocated or you may not have authorization.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/account/orders"
            className="h-11 px-5 inline-flex items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            Back to Orders
          </Link>
          <button
            type="button"
            onClick={() => refetch()}
            className="h-11 px-5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const items = order.items || [];
  const status = order.status;
  const isCancelled = status === "cancelled" || status === "refunded";
  const isDelivered = status === "delivered";
  const isShipped = status === "shipped";
  const isProcessing = status === "processing";
  const isPaid = status === "paid";
  const isPending = status === "pending";

  const canCancel = isPending || isProcessing;

  // Determine current timeline active step index
  let currentStepIndex = 0;
  if (isPending) currentStepIndex = 0;
  else if (isPaid) currentStepIndex = 1;
  else if (isProcessing) currentStepIndex = 2;
  else if (isShipped) currentStepIndex = 3;
  else if (isDelivered) currentStepIndex = 4;

  const getStatusBadge = (s: string, label?: string) => {
    const statusText = label || s;
    if (isDelivered) {
      return (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
          <span>{statusText}</span>
        </span>
      );
    }
    if (isShipped) {
      return (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
          <Truck className="h-3 w-3" aria-hidden="true" />
          <span>{statusText}</span>
        </span>
      );
    }
    if (isProcessing) {
      return (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden="true" />
          <span>{statusText}</span>
        </span>
      );
    }
    if (isPaid) {
      return (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center gap-1">
          <CreditCard className="h-3 w-3" aria-hidden="true" />
          <span>{statusText}</span>
        </span>
      );
    }
    if (isCancelled) {
      return (
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
          <AlertCircle className="h-3 w-3" aria-hidden="true" />
          <span>{statusText}</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
        <Clock className="h-3 w-3" aria-hidden="true" />
        <span>{statusText}</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMBS & TOP ACTIONS                                            */}
      {/* ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5 print:hidden">
        <div className="space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link href="/account" className="hover:text-blue-600 transition-colors">
              My Account
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <Link href="/account/orders" className="hover:text-blue-600 transition-colors">
              Order History
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span className="text-slate-900 font-bold font-mono" aria-current="page">
              Order #{order.order_number}
            </span>
          </nav>

          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block sm:hidden">
              ORDER DETAILS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              Order {order.order_number}
            </h1>
            {getStatusBadge(order.status, order.status_label)}
          </div>

          <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span>Placed on {formatDate(order.created_at)}</span>
          </span>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="h-10 px-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            <span>Print Receipt</span>
          </button>

          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelDialogOpen(true)}
              className="h-10 px-4 inline-flex items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              Cancel Order
            </button>
          )}

          <Link
            href="/account/orders"
            className="h-10 px-4 inline-flex items-center justify-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>All Orders</span>
          </Link>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. ORDER STATUS HERO & FULFILLMENT TIMELINE                             */}
      {/* ======================================================================= */}
      {isCancelled ? (
        <div className="p-6 rounded-[20px] bg-rose-50/70 border border-rose-200 shadow-2xs flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <XCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-rose-900">Order Cancelled</h2>
            <p className="text-xs text-rose-700 leading-relaxed">
              This order was cancelled and is no longer being processed. Any authorized charges have been released or refunded.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 rounded-[20px] bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                FULFILLMENT STATUS
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {isDelivered
                  ? "Order Delivered Successfully"
                  : isShipped
                  ? "Package In Transit to Laboratory"
                  : isProcessing
                  ? "Order in Quality Control & Calibration"
                  : isPaid
                  ? "Payment Confirmed & Queued"
                  : "Order Placed & Awaiting Verification"}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100">
              <Truck className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <span>{order.shipping_method || "Standard Courier Logistics"}</span>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {standardSteps.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.id} className="relative flex md:flex-col items-start gap-3 md:gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-colors ${
                        isPassed
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : idx + 1}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span
                      className={`text-xs font-bold block ${
                        isCurrent ? "text-blue-600" : isPassed ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[11px] text-slate-400 leading-tight block">
                      {step.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. MAIN CONTENT: ITEMS & LOGISTICS / FINANCIAL SUMMARY                  */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <span>Items in Your Order ({items.length})</span>
              </h2>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400">
                    <Package className="h-7 w-7" aria-hidden="true" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                      {item.product_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono text-[11px] font-semibold text-slate-400">
                        SKU: {item.sku}
                      </span>
                      <span>•</span>
                      <span>Qty: {item.quantity}</span>
                      <span>•</span>
                      <span>Unit: {formatCurrency(item.unit_price)}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                      {formatCurrency(item.total_price || item.unit_price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Delivery Address Card */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <span>Delivery &amp; Logistics Destination</span>
              </h2>
            </div>

            <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900 block text-sm">
                {order.shipping_address?.first_name || order.user?.first_name}{" "}
                {order.shipping_address?.last_name || order.user?.last_name || ""}
              </span>
              <p>{order.shipping_address?.address_line_1 || "Standard Laboratory Dock"}</p>
              {order.shipping_address?.address_line_2 && (
                <p>{order.shipping_address.address_line_2}</p>
              )}
              <p>
                {order.shipping_address?.city || "Cambridge"},{" "}
                {order.shipping_address?.state || "MA"}{" "}
                {order.shipping_address?.postal_code || "02139"}
              </p>
              <p>{order.shipping_address?.country_code || "United States"}</p>
            </div>

            {/* Tracking Status Note */}
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Tracking information will appear here when available.</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Financial Summary & Payment */}
        <div className="space-y-6">
          {/* Financial Breakdown */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <span>Financial Breakdown</span>
              </h2>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(order.subtotal || order.total_amount)}
                </span>
              </div>

              {Boolean(order.discount_amount) && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Promotional Discount</span>
                  <span>-{formatCurrency(order.discount_amount || 0)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 font-medium">
                <span>Certified Logistics</span>
                <span className="font-semibold text-slate-900">
                  {order.shipping_amount ? formatCurrency(order.shipping_amount) : "$0.00"}
                </span>
              </div>

              <div className="flex justify-between text-slate-500 font-medium">
                <span>Estimated Tax</span>
                <span className="font-semibold text-slate-900">
                  {order.tax_amount ? formatCurrency(order.tax_amount) : "$0.00"}
                </span>
              </div>

              <div className="flex items-center justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                <span>Order Total</span>
                <span className="text-blue-600">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="border-b border-slate-100 pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                <span>Payment Information</span>
              </h2>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Method</span>
                <span className="font-bold text-slate-900">
                  {order.payment_method || "Credit / Debit Card"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payment Status</span>
                <span className="font-bold text-emerald-600 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  <span>{order.status === "paid" ? "Paid" : "Authorized"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 print:hidden">
            <Link
              href="/products"
              className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <Link
              href="/account/orders"
              className="w-full h-11 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back to Order History
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4. CANCELLATION DIALOG                                                  */}
      {/* ======================================================================= */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md rounded-[20px] bg-white p-6 border-slate-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-900">
              Cancel Order {order.order_number}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Please provide a reason for cancelling this laboratory hardware order.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3">
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelDialogOpen(false)}
              className="rounded-xl text-xs"
            >
              Keep Order
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={!cancelReason.trim() || cancelOrderMutation.isPending}
              isLoading={cancelOrderMutation.isPending}
              onClick={handleCancelSubmit}
              className="rounded-xl text-xs"
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
