"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Clock,
  Truck,
  CreditCard,
  User,
  MapPin,
  FileText,
  ChevronRight,
  CheckCircle2,
  RotateCw,
  AlertCircle,
  Package,
  Ban,
  DollarSign,
  ShieldCheck,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Can } from "@/components/ui/can";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useOrder, useOrderTimeline, useUpdateOrderStatus, useAddOrderNotes } from "@/hooks/use-orders";
import { toast } from "sonner";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: order, isLoading, isError } = useOrder(id);
  const { data: timeline } = useOrderTimeline(id);

  const updateStatusMutation = useUpdateOrderStatus();
  const addNotesMutation = useAddOrderNotes();

  // Status Change Dialog State
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isConfirmStatusOpen, setIsConfirmStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusComment, setStatusComment] = useState("");

  // Admin Note State
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const handleOpenStatusDialog = () => {
    if (order) {
      setSelectedStatus(order.status);
      setStatusComment("");
      setIsStatusDialogOpen(true);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus || !order) return;

    // High impact status changes (Cancelled, Refunded, On Hold) require explicit confirmation
    if (["cancelled", "refunded", "on_hold"].includes(selectedStatus) && selectedStatus !== order.status) {
      setIsConfirmStatusOpen(true);
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: selectedStatus,
        comment: statusComment.trim() || undefined,
      });
      toast.success(`Order status updated to ${selectedStatus.toUpperCase()}`);
      setIsStatusDialogOpen(false);
    } catch {
      toast.error("Failed to update order status.");
    }
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedStatus || !order) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: order.id,
        status: selectedStatus,
        comment: statusComment.trim() || undefined,
      });
      toast.success(`Order status updated to ${selectedStatus.toUpperCase()}`);
      setIsConfirmStatusOpen(false);
      setIsStatusDialogOpen(false);
    } catch {
      toast.error("Failed to update order status.");
    }
  };

  const handleSaveAdminNotes = async () => {
    if (!order) return;
    try {
      await addNotesMutation.mutateAsync({ id: order.id, notes: adminNotes });
      toast.success("Admin notes saved.");
      setIsEditingNotes(false);
    } catch {
      toast.error("Failed to save admin notes.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2 rounded-[20px]" />
          <Skeleton className="h-96 rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
          <ShoppingCart className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500">The requested order record does not exist or has been archived.</p>
        <Link href="/admin/orders">
          <Button variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus.toLowerCase()) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            <span>Delivered</span>
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Truck className="h-3 w-3" aria-hidden="true" />
            <span>Shipped</span>
          </span>
        );
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CreditCard className="h-3 w-3" aria-hidden="true" />
            <span>Paid</span>
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <RotateCw className="h-3 w-3" aria-hidden="true" />
            <span>Processing</span>
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>Pending</span>
          </span>
        );
      case "on_hold":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>On Hold</span>
          </span>
        );
      case "cancelled":
      case "refunded":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="h-3 w-3" aria-hidden="true" />
            <span>{orderStatus.toUpperCase()}</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {orderStatus}
          </span>
        );
    }
  };

  const customerName = order.user
    ? `${order.user.first_name} ${order.user.last_name}`
    : "Guest Customer";

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
          <Link href="/admin/orders" className="hover:text-blue-600 transition-colors">
            Orders
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold font-mono" aria-current="page">
            Order #{order.order_number}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              ORDER DETAILS
            </span>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {order.order_number}
              </h1>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Placed on {formatDate(order.created_at)} • Currency: {order.currency_code}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold shadow-2xs">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back to Orders</span>
              </Button>
            </Link>
            <Can permission="order.update">
              <Button
                size="sm"
                onClick={handleOpenStatusDialog}
                className="h-10 px-4 gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-xs"
              >
                <RotateCw className="h-4 w-4" aria-hidden="true" />
                <span>Update Status</span>
              </Button>
            </Can>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. ORDER DETAILS GRID                                                   */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Order Items & History Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Purchased Line Items */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Order Items ({order.item_count})
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {order.items?.length ?? 0} Unique SKU{order.items?.length !== 1 ? "s" : ""}
              </span>
            </div>

            {order.items && order.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-4">Product / SKU</th>
                      <th className="pb-3 pr-4 text-right">Price</th>
                      <th className="pb-3 pr-4 text-center">Qty</th>
                      <th className="pb-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="py-3 pr-4">
                          <div className="font-extrabold text-xs text-slate-900">
                            {item.product_name}
                          </div>
                          <div className="font-mono text-[11px] text-slate-400">SKU: {item.sku}</div>
                        </td>
                        <td className="py-3 pr-4 text-right font-medium text-slate-600">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-3 pr-4 text-center font-extrabold text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right font-extrabold text-xs text-slate-900">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No item breakdown available for this order record.
              </div>
            )}
          </div>

          {/* Chronological Lifecycle Timeline */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Order Lifecycle Timeline</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Immutable audit of order state transitions.</p>
            </div>

            {timeline && timeline.length > 0 ? (
              <div className="space-y-4 border-l-2 border-blue-100 ml-2 pl-4">
                {timeline.map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-blue-600 border-2 border-white" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 uppercase">
                        {entry.to_status}
                      </span>
                      {entry.from_status && (
                        <span className="text-[11px] text-slate-400 font-medium">from {entry.from_status}</span>
                      )}
                      <span className="text-[11px] text-slate-400 ml-auto font-medium">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                    {entry.comment && (
                      <p className="text-xs text-slate-600 mt-1 italic">
                        "{entry.comment}"
                      </p>
                    )}
                    {entry.changed_by && (
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        By: {entry.changed_by.first_name} {entry.changed_by.last_name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2">No transition history logged yet.</p>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Financials, Customer & Fulfillment */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Financial Breakdown</h2>
            </div>

            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">Subtotal:</span>
                <span className="font-extrabold text-slate-900">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Discount:</span>
                <span className="font-extrabold text-emerald-600">
                  -{formatCurrency(order.discount_amount)}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Tax:</span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(order.tax_amount)}
                </span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500 font-medium">Shipping:</span>
                <span className="font-semibold text-slate-700">
                  {formatCurrency(order.shipping_amount)}
                </span>
              </div>
              <div className="flex justify-between pt-3 text-sm font-extrabold border-t border-slate-200">
                <span className="text-slate-900">Grand Total:</span>
                <span className="text-blue-600 text-base">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Profile & Address */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Customer &amp; Delivery</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  Customer
                </span>
                <p className="font-extrabold text-slate-900">{customerName}</p>
                <p className="text-slate-500">{order.user?.email || "No email on record"}</p>
              </div>

              {order.shipping_address && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-600" aria-hidden="true" /> Shipping Address
                  </span>
                  <div className="text-slate-700 space-y-0.5">
                    <p className="font-semibold text-slate-900">{order.shipping_address.address_line_1}</p>
                    {order.shipping_address.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
                    <p>
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                    </p>
                    <p className="font-mono text-[11px] text-slate-400">{order.shipping_address.country_code}</p>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1 flex items-center gap-1">
                  <Truck className="h-3 w-3 text-blue-600" aria-hidden="true" /> Shipping Method
                </span>
                <p className="font-extrabold text-slate-900">
                  {order.shipping_method || "Standard Delivery"}
                </p>
              </div>
            </div>
          </div>

          {/* Internal Admin Notes */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Admin Notes</h2>
              </div>
              {!isEditingNotes && (
                <button
                  type="button"
                  onClick={() => {
                    setAdminNotes(order.admin_notes || "");
                    setIsEditingNotes(true);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="text-xs">
              {isEditingNotes ? (
                <div className="space-y-3">
                  <Textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Private staff notes regarding this order..."
                    className="rounded-xl bg-slate-50 text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingNotes(false)}
                      className="h-8 px-3 text-xs font-bold rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveAdminNotes}
                      isLoading={addNotesMutation.isPending}
                      className="h-8 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                    >
                      Save Note
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 italic">
                  {order.admin_notes || "No internal staff notes recorded."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3. UPDATE STATUS MODAL DIALOG                                           */}
      {/* ======================================================================= */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="rounded-[20px] bg-white border border-slate-200/90 shadow-xl max-w-md">
          <form onSubmit={handleUpdateStatus}>
            <DialogHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCw className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <DialogTitle className="text-base font-extrabold text-slate-900">
                  Update Order Status
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Transition order {order.order_number} to a new lifecycle state.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select New Status *</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Comment / Reason (Optional)</label>
                <Textarea
                  placeholder="e.g. Dispatched via FedEx tracking #12345..."
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  rows={3}
                  className="rounded-xl bg-slate-50 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStatusDialogOpen(false)}
                className="h-10 px-4 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={updateStatusMutation.isPending}
                className="h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Update Status
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isConfirmStatusOpen}
        onOpenChange={setIsConfirmStatusOpen}
        title="Update order status?"
        description={`You are about to change order #${order.order_number} from "${order.status}" to "${selectedStatus.toUpperCase()}".`}
        confirmText="Update Status"
        variant={selectedStatus === "cancelled" || selectedStatus === "refunded" ? "danger" : "warning"}
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
}
