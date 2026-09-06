"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  ShieldCheck,
  Printer,
  ArrowRight,
  ShoppingBag,
  Cpu,
  Copy,
  Check,
  RotateCcw,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckoutResponseData } from "@/services/checkout-service";
import { useCustomerOrder } from "@/hooks/use-customer";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  const orderNumberParam = searchParams.get("order_number") || "";

  const [cachedConfirmation, setCachedConfirmation] = useState<CheckoutResponseData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("last_order_confirmation");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCachedConfirmation(parsed);
        } catch {
          // Ignore
        }
      }
    }
  }, []);

  const { data: remoteOrder, isLoading, isError, refetch } = useCustomerOrder(orderId);

  const order = cachedConfirmation?.order || remoteOrder;
  const payment = cachedConfirmation?.payment;

  const orderNumber = order?.order_number || orderNumberParam || "ORD-2026-CONFIRMED";

  const handleCopyOrderNumber = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading && !cachedConfirmation) {
    return (
      <div className="bg-white min-h-screen py-12">
        <Container className="max-w-3xl space-y-8">
          <Skeleton className="h-48 rounded-[24px] w-full" />
          <Skeleton className="h-96 rounded-[20px] w-full" />
        </Container>
      </div>
    );
  }

  if (isError && !cachedConfirmation && !orderNumberParam) {
    return (
      <div className="bg-white min-h-[70vh] flex items-center justify-center py-16">
        <Container className="text-center max-w-md space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <Cpu className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Unable to load order</h1>
          <p className="text-sm text-slate-500">
            Your order may still have been placed. Please check your account orders or try again.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => refetch()}
              className="inline-flex h-11 items-center justify-center px-6 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center px-5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10 lg:py-16">
      <Container className="max-w-3xl space-y-8">
        {/* ======================================================================= */}
        {/* 1. SUCCESS HERO CARD                                                    */}
        {/* ======================================================================= */}
        <div className="text-center space-y-4 rounded-[24px] bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-white p-8 sm:p-10 border border-emerald-100 shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white mx-auto shadow-lg shadow-emerald-600/20">
            <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">
              LABORATORY ORDER CONFIRMED
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Thank you for your order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your neural telemetry hardware order has been placed into our calibrated fulfillment queue.
            </p>
          </div>

          {/* Order Number & Copy Control */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3 shadow-2xs border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Order Number:</span>
            <span className="font-mono font-extrabold text-slate-900">{orderNumber}</span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              aria-label="Copy order number"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {payment?.transaction_id && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-medium">Transaction:</span>
                <span className="font-mono text-slate-700 font-semibold">{payment.transaction_id}</span>
              </>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 2. ORDER DETAILS & RECEIPT CARD                                         */}
        {/* ======================================================================= */}
        <div className="p-6 sm:p-8 rounded-[20px] border border-slate-200/90 bg-white shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Order Summary</h2>
              <span className="text-xs text-slate-500">
                Placed on {order?.created_at ? formatDate(order.created_at) : "Today"}
              </span>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors print:hidden"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>

          {/* Purchased Line Items */}
          {order?.items && order.items.length > 0 && (
            <div className="divide-y divide-slate-100 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block pb-1">
                Purchased Equipment ({order.items.length})
              </span>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="space-y-0.5 min-w-0 pr-3">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.product_name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono block">
                      SKU: {item.sku} • Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 shrink-0">
                    {formatCurrency(item.total_price || item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Delivery Destination & Financials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Delivery Information */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-blue-600" />
                <span>Delivery Destination</span>
              </h4>
              <p className="font-bold text-slate-900 pt-1">
                {order?.shipping_address?.first_name || "Laboratory Customer"}{" "}
                {order?.shipping_address?.last_name || ""}
              </p>
              <p>{order?.shipping_address?.address_line_1 || "Standard Delivery Dock"}</p>
              <p>
                {order?.shipping_address?.city || "Cambridge"}, {order?.shipping_address?.state || "MA"}{" "}
                {order?.shipping_address?.postal_code || "02138"}
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Tracking information will appear when available.
              </p>
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(order?.subtotal || order?.total_amount || 0)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{order?.shipping_amount ? formatCurrency(order.shipping_amount) : "FREE"}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span>{order?.tax_amount ? formatCurrency(order.tax_amount) : formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                <span>Grand Total</span>
                <span>{formatCurrency(order?.total_amount || 0)}</span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 3. POST-PURCHASE TIMELINE                                             */}
          {/* ===================================================================== */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              What Happens Next
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                <span className="font-bold text-blue-600 block">01. Order Recorded</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Your purchase specification has been confirmed in our dispatch system.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                <span className="font-bold text-blue-600 block">02. Hardware Testing</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Sensors undergo calibrated verification and ESD-safe packaging.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-100 space-y-1">
                <span className="font-bold text-blue-600 block">03. Courier Dispatch</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Tracking notifications will be updated in your account dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-slate-100 print:hidden">
            <Link
              href="/products"
              className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
            <Link
              href={order?.id ? `/account/orders/${order.id}` : "/account/orders"}
              className="h-12 px-6 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>View My Orders</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
