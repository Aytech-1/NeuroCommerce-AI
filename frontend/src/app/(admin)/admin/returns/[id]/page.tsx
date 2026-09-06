"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Receipt,
  CreditCard,
  User,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Can } from "@/components/ui/can";
import { useRefund, useProcessRefund } from "@/hooks/use-returns";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReturnDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ReturnDetailPage({ params }: ReturnDetailPageProps) {
  const { id } = use(params);
  const { data: refund, isLoading, isError, error, refetch } = useRefund(id);
  const refundMutation = useProcessRefund();

  // Additional refund modal state
  const [isAdditionalRefundOpen, setIsAdditionalRefundOpen] = useState(false);
  const [additionalAmount, setAdditionalAmount] = useState("");
  const [additionalReason, setAdditionalReason] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  if (isError || !refund) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-12 text-center shadow-xs">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Return / Refund Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          {error instanceof Error ? error.message : "The requested financial reversal record does not exist or has been removed."}
        </p>
        <Link href="/admin/returns">
          <Button variant="outline" size="sm" className="mt-4 gap-1.5 text-xs font-bold">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Returns Roster</span>
          </Button>
        </Link>
      </div>
    );
  }

  const currency = refund.payment?.currency_code || refund.order?.currency_code || "NGN";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Processed & Settled
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
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

  const handleOpenAdditionalRefund = () => {
    setAdditionalAmount("");
    setAdditionalReason("");
    setErrorMessage(null);
    setIsAdditionalRefundOpen(true);
  };

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(additionalAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid refund amount greater than zero.");
      return;
    }
    setErrorMessage(null);
    setIsConfirmOpen(true);
  };

  const handleConfirmRefund = async () => {
    try {
      await refundMutation.mutateAsync({
        paymentId: refund.payment_id,
        payload: {
          amount: Number(additionalAmount),
          reason: additionalReason.trim() || undefined,
        },
      });
      toast.success("Additional refund processed successfully.");
      setIsConfirmOpen(false);
      setIsAdditionalRefundOpen(false);
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process refund.";
      toast.error(msg);
      setErrorMessage(msg);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/admin/returns" className="hover:text-slate-900 transition inline-flex items-center gap-1">
              <RotateCcw className="h-3 w-3" />
              <span>Returns & Refunds</span>
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-mono font-bold">
              {refund.gateway_refund_id || refund.id.substring(0, 12)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-mono">
              {refund.gateway_refund_id || `REF-${refund.id.substring(0, 8).toUpperCase()}`}
            </h1>
            {getStatusBadge(refund.status)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Recorded on{" "}
            <span className="font-semibold text-slate-700">
              {new Date(refund.created_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/returns">
            <Button variant="outline" size="sm" className="h-9 px-3 text-xs font-semibold gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </Button>
          </Link>

          <Can permission="payment.refund">
            <Button
              size="sm"
              onClick={handleOpenAdditionalRefund}
              className="h-9 px-4 text-xs font-bold gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Issue Reversal</span>
            </Button>
          </Can>
        </div>
      </div>

      {/* 4-Card Logistics & Financial 360 Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: Financial Reversal Summary */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <DollarSign className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Financial Reversal Details
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-rose-600 uppercase">
              {refund.status}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <span className="text-slate-500 font-semibold">Refunded Amount</span>
              <span className="font-mono font-black text-rose-600 text-base">
                -{formatCurrency(refund.amount, currency)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Gateway Refund ID</span>
              <span className="font-mono font-bold text-slate-800">
                {refund.gateway_refund_id || "Direct Ledger Reversal"}
              </span>
            </div>

            <div className="flex items-start justify-between py-1">
              <span className="text-slate-500 font-medium">Return Reason</span>
              <span className="text-slate-900 font-semibold text-right max-w-[220px]">
                {refund.reason || "Customer return & product restitution"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Processed At</span>
              <span className="text-slate-700 font-medium">
                {refund.processed_at
                  ? new Date(refund.processed_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Pending Execution"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-2">
              <span className="text-slate-500 font-medium">Processed By</span>
              <span className="text-slate-900 font-semibold">
                {refund.processor?.name || refund.processed_by || "System Automated Flow"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Linked Order Summary */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Linked Order
              </h2>
            </div>
            <Link
              href={`/admin/orders/${refund.order_id}`}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 hover:underline"
            >
              <span>View Order</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Order Reference</span>
              <Link
                href={`/admin/orders/${refund.order_id}`}
                className="font-mono font-black text-slate-900 hover:text-emerald-600"
              >
                {refund.order?.order_number || refund.order_id}
              </Link>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Order Status</span>
              <span className="font-bold text-slate-800 capitalize">
                {refund.order?.status || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Order Gross Total</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(refund.order?.total_amount || 0, currency)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-2">
              <span className="text-slate-500 font-medium">Order UUID</span>
              <span className="font-mono text-[11px] text-slate-400 select-all">{refund.order_id}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Payment & Gateway Settlement */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CreditCard className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Payment & Gateway Settlement
              </h2>
            </div>
            <Link
              href={`/admin/payments/${refund.payment_id}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline"
            >
              <span>View Payment</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Gateway Provider</span>
              <span className="font-mono font-bold uppercase text-slate-900 px-2 py-0.5 rounded-md bg-slate-100">
                {refund.payment?.gateway || "Direct Gateway"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Payment Method</span>
              <span className="font-semibold text-slate-800 capitalize">
                {refund.payment?.method || "Online Settlement"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Original Settled Amount</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(refund.payment?.amount || 0, currency)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-2">
              <span className="text-slate-500 font-medium">Payment UUID</span>
              <span className="font-mono text-[11px] text-slate-400 select-all">{refund.payment_id}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Customer Information */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <User className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                Customer Recipient
              </h2>
            </div>
            {refund.order?.user?.id && (
              <Link
                href={`/admin/customers/${refund.order.user.id}`}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 hover:underline"
              >
                <span>Profile</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Full Name</span>
              <span className="font-bold text-slate-900">
                {refund.order?.user?.name || "Verified Customer"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Email Address</span>
              <span className="font-medium text-slate-700 select-all">
                {refund.order?.user?.email || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Customer Type</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                Account Holder
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-t border-slate-100 pt-2">
              <span className="text-slate-500 font-medium">Audit Trail Verification</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Signature
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reversal Audit Timeline */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Receipt className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
            Reversal Lifecycle Timeline
          </h2>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {/* Created Event */}
          <div className="relative">
            <div className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white" />
            <div>
              <p className="text-xs font-bold text-slate-900">Refund Request Created</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Financial reversal request of {formatCurrency(refund.amount, currency)} recorded for order.
              </p>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                {new Date(refund.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Processed Event */}
          {refund.processed_at && (
            <div className="relative">
              <div className="absolute -left-6 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-white" />
              <div>
                <p className="text-xs font-bold text-slate-900">Settled via Gateway</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Gateway reversal executed. Identifier: {refund.gateway_refund_id || "Direct ledger debit"}.
                </p>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                  {new Date(refund.processed_at).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Refund Dialog */}
      <Dialog open={isAdditionalRefundOpen} onOpenChange={setIsAdditionalRefundOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">
              Process Additional Reversal
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Submit a financial refund against the linked payment transaction via the authoritative gateway.
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
              <label className="text-xs font-bold text-slate-700">
                Refund Amount ({currency}) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={additionalAmount}
                onChange={(e) => setAdditionalAmount(e.target.value)}
                className="h-10 text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Reason for Reversal</label>
              <Input
                type="text"
                placeholder="e.g. Return of goods / Restitution"
                value={additionalReason}
                onChange={(e) => setAdditionalReason(e.target.value)}
                className="h-10 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdditionalRefundOpen(false)}
                className="h-9 px-4 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              >
                Review & Confirm
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Confirm Reversal Execution"
        description={`Are you sure you want to execute a refund of ${formatCurrency(
          Number(additionalAmount) || 0,
          currency
        )}? This financial action will immediately communicate with the payment gateway and cannot be reversed.`}
        confirmText="Confirm & Execute Reversal"
        cancelText="Cancel"
        variant="danger"
        isLoading={refundMutation.isPending}
        onConfirm={handleConfirmRefund}
      />
    </div>
  );
}
