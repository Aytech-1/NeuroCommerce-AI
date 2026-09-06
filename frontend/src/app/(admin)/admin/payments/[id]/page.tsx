"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Building2,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Receipt,
  User,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Can } from "@/components/ui/can";
import { formatCurrency, formatDate } from "@/lib/utils";
import { usePayment, useRefundPayment } from "@/hooks/use-payments";
import { toast } from "sonner";
import { ApiError } from "@/types/api";

export default function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: payment, isLoading, isError, refetch } = usePayment(id);
  const refundMutation = useRefundPayment();

  // Refund Modal State
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [refundReason, setRefundReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleOpenRefund = () => {
    if (payment) {
      setRefundAmount(payment.amount.toString());
      setRefundReason("");
      setErrorMessage(null);
      setIsRefundOpen(true);
    }
  };

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(refundAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid refund amount.");
      return;
    }
    if (payment && parsedAmount > payment.amount) {
      setErrorMessage("Refund amount cannot exceed payment amount.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!payment) return;
    try {
      await refundMutation.mutateAsync({
        id: payment.id,
        payload: {
          amount: Number(refundAmount),
          reason: refundReason.trim() || undefined,
        },
      });
      toast.success("Refund processed successfully.");
      setIsConfirmOpen(false);
      setIsRefundOpen(false);
      refetch();
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.message || "Failed to process refund.");
      setErrorMessage(error.message || "Failed to process refund.");
      setIsConfirmOpen(false);
    }
  };

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

  if (isError || !payment) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
          <CreditCard className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Payment Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested payment transaction does not exist or has been removed.</p>
        <Link href="/admin/payments">
          <Button variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Back to Payments
          </Button>
        </Link>
      </div>
    );
  }

  const isCompleted = payment.status === "completed";

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
          <Link href="/admin/payments" className="hover:text-blue-600 transition-colors">
            Payments
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold font-mono" aria-current="page">
            {payment.gateway_payment_id || payment.id.substring(0, 18)}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-sm border border-blue-100 shadow-2xs">
              <CreditCard className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
                PAYMENT RECORD
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {payment.gateway_payment_id || payment.id}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized via {payment.gateway.toUpperCase()} • Captured on {formatDate(payment.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isCompleted && (
              <Can permission="payment.refund">
                <Button
                  onClick={handleOpenRefund}
                  variant="outline"
                  className="h-10 px-4 gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Process Refund</span>
                </Button>
              </Can>
            )}
            <Link href="/admin/payments">
              <Button variant="outline" size="sm" className="h-10 px-4 gap-2 text-xs font-bold shadow-2xs">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>All Payments</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. OVERVIEW & ORDER BREAKDOWN                                           */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Payment & Gateway Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Transaction Summary</h2>
                <p className="text-xs text-slate-500 mt-0.5">Payment settlement and financial breakdown.</p>
              </div>
              <div>{getStatusBadge(payment.status)}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Amount</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">
                  {formatCurrency(payment.amount, payment.currency_code)}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Payment Gateway</span>
                <span className="text-sm font-bold text-slate-800 uppercase mt-1 block">
                  {payment.gateway}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Payment Method</span>
                <span className="text-sm font-bold text-slate-800 uppercase mt-1 block">
                  {payment.method}
                </span>
              </div>
              {payment.card_brand && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Card Info</span>
                  <span className="text-sm font-semibold text-slate-700 mt-1 block">
                    {payment.card_brand} •••• {payment.card_last_four}
                  </span>
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Paid At</span>
                <span className="text-xs font-semibold text-slate-700 mt-1 block">
                  {payment.paid_at ? formatDate(payment.paid_at) : "Pending"}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Currency</span>
                <span className="text-xs font-bold text-slate-700 uppercase mt-1 block">
                  {payment.currency_code}
                </span>
              </div>
            </div>
          </div>

          {/* Transactions History */}
          {payment.transactions && payment.transactions.length > 0 && (
            <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Gateway Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Gateway Ref</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payment.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-bold uppercase">{tx.type}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {tx.gateway_transaction_id || tx.id.substring(0, 14)}
                        </td>
                        <td className="py-2.5 px-3 font-extrabold">
                          {formatCurrency(tx.amount, tx.currency_code)}
                        </td>
                        <td className="py-2.5 px-3">{getStatusBadge(tx.status)}</td>
                        <td className="py-2.5 px-3 text-slate-500">{formatDate(tx.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Refunds History */}
          {payment.refunds && payment.refunds.length > 0 && (
            <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider text-rose-700">
                Refund History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">Refund ID</th>
                      <th className="py-2.5 px-3">Reason</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payment.refunds.map((ref) => (
                      <tr key={ref.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {ref.gateway_refund_id || ref.id.substring(0, 14)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{ref.reason || "Standard return"}</td>
                        <td className="py-2.5 px-3 font-extrabold text-rose-600">
                          -{formatCurrency(ref.amount, payment.currency_code)}
                        </td>
                        <td className="py-2.5 px-3">{getStatusBadge(ref.status)}</td>
                        <td className="py-2.5 px-3 text-slate-500">{formatDate(ref.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Linked Order & Customer */}
        <div className="space-y-6">
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h3 className="text-base font-extrabold text-slate-900">Linked Order</h3>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Order ID</span>
                <span className="font-mono text-xs font-bold text-slate-700 block mt-0.5 truncate">
                  {payment.order_id}
                </span>
              </div>

              {payment.order && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Order Number</span>
                  <Link
                    href={`/admin/orders/${payment.order_id}`}
                    className="font-mono text-sm font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-0.5"
                  >
                    <span>{payment.order.order_number}</span>
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              )}

              {payment.order?.user && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Customer</span>
                  <Link
                    href={`/admin/customers/${payment.order.user_id}`}
                    className="text-xs font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1 mt-1"
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>{payment.order.user.first_name} {payment.order.user.last_name}</span>
                  </Link>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {payment.order.user.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent className="sm:max-w-md rounded-[24px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-slate-900">Process Payment Refund</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit a full or partial refund to the customer via {payment.gateway.toUpperCase()}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRefund} className="space-y-4 py-2">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Refund Amount ({payment.currency_code}) *</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={payment.amount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="rounded-xl text-xs bg-slate-50 font-bold"
                required
              />
              <span className="text-[11px] text-slate-400">
                Max refundable: {formatCurrency(payment.amount, payment.currency_code)}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Reason for Refund</label>
              <Input
                type="text"
                placeholder="e.g. Customer return, defective item, goodwill..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="rounded-xl text-xs bg-slate-50"
              />
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRefundOpen(false)}
                className="rounded-xl text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Proceed to Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Confirm Payment Refund?"
        description={`Are you sure you want to refund ${formatCurrency(Number(refundAmount), payment.currency_code)} for payment reference "${payment.gateway_payment_id || payment.id}"? This will reverse captured funds.`}
        confirmText="Confirm Refund"
        variant="danger"
        isLoading={refundMutation.isPending}
        onConfirm={handleConfirmRefund}
      />
    </div>
  );
}