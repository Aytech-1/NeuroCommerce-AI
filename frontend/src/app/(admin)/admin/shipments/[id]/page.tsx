"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Receipt,
  User,
  ShoppingBag,
  Building2,
  Package,
  MapPin,
  FileText,
  Weight,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Can } from "@/components/ui/can";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useShipment, useUpdateShipmentStatus } from "@/hooks/use-shipping";
import { toast } from "sonner";
import { ApiError } from "@/types/api";

export default function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: shipment, isLoading, isError, refetch } = useShipment(id);
  const updateStatusMutation = useUpdateShipmentStatus();

  // Status Mutation Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getStatusBadge = (shipmentStatus: string) => {
    switch (shipmentStatus.toLowerCase()) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            <span>Delivered</span>
          </span>
        );
      case "in_transit":
      case "out_for_delivery":
      case "picked_up":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="h-3 w-3" aria-hidden="true" />
            <span>{shipmentStatus.replace(/_/g, " ")}</span>
          </span>
        );
      case "label_created":
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>{shipmentStatus.replace(/_/g, " ")}</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            <span>Failed</span>
          </span>
        );
      case "returned":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Returned</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <span>{shipmentStatus}</span>
          </span>
        );
    }
  };

  const handleOpenStatusModal = () => {
    if (shipment) {
      setSelectedStatus(shipment.status);
      setLocation("");
      setDescription("");
      setErrorMessage(null);
      setIsStatusModalOpen(true);
    }
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus || !shipment) return;

    if (selectedStatus === shipment.status) {
      setErrorMessage("Please select a different status to transition this shipment.");
      return;
    }

    // Critical transitions require confirmation
    if (["delivered", "failed", "returned"].includes(selectedStatus)) {
      setIsConfirmOpen(true);
      return;
    }

    executeStatusUpdate();
  };

  const executeStatusUpdate = async () => {
    if (!shipment || !selectedStatus) return;

    try {
      await updateStatusMutation.mutateAsync({
        id: shipment.id,
        payload: {
          status: selectedStatus,
          location: location.trim() || undefined,
          description: description.trim() || undefined,
        },
      });

      toast.success(`Shipment status updated to ${selectedStatus.replace(/_/g, " ").toUpperCase()}`);
      setIsConfirmOpen(false);
      setIsStatusModalOpen(false);
      refetch();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error.response?.data?.message || error.message || "Failed to update shipment status.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-[20px]" />
          <Skeleton className="h-96 rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (isError || !shipment) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
          <AlertCircle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Shipment Record Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested shipment does not exist or you do not have permission to view it.
        </p>
        <Link href="/admin/shipments">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 mt-2">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Shipments</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ======================================================================= */}
      {/* 1. HEADER & BREADCRUMBS                                                 */}
      {/* ======================================================================= */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
            Admin Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <Link href="/admin/shipments" className="hover:text-blue-600 transition-colors">
            Shipments
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold font-mono" aria-current="page">
            {shipment.tracking_number || shipment.id.substring(0, 18)}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-sm border border-blue-100 shadow-2xs">
              <Truck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
                SHIPMENT RECORD
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                {shipment.tracking_number || shipment.id}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Dispatched via <span className="font-bold text-slate-700 uppercase">{shipment.carrier}</span> • Created on{" "}
                {formatDate(shipment.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {shipment.label_url && (
              <a href={shipment.label_url} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3.5 gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 rounded-xl"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span>View Label</span>
                </Button>
              </a>
            )}

            {shipment.tracking_url && (
              <a href={shipment.tracking_url} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-3.5 gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 rounded-xl"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span>Carrier Tracking</span>
                </Button>
              </a>
            )}

            <Can permission="shipping.update">
              <Button
                onClick={handleOpenStatusModal}
                className="h-10 px-4 gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xs"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Update Status</span>
              </Button>
            </Can>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. MAIN 360 GRID                                                        */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Logistics Overview, Timeline, Linked Order */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logistics Overview Card */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Package className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Logistics Summary</h2>
              </div>
              <div>{getStatusBadge(shipment.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Carrier &amp; Service
                </span>
                <p className="text-sm font-extrabold text-slate-900 uppercase">{shipment.carrier}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {shipment.service_level ? `${shipment.service_level} Service` : "Standard Delivery"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Tracking Reference
                </span>
                <p className="text-sm font-extrabold text-blue-700 font-mono">
                  {shipment.tracking_number || "Not assigned"}
                </p>
                <p className="text-[11px] text-slate-400 font-mono truncate">UUID: {shipment.id}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Weight &amp; Parcel
                </span>
                <p className="text-sm font-extrabold text-slate-900">
                  {shipment.weight ? `${shipment.weight.toFixed(2)} kg` : "Standard Weight"}
                </p>
                <p className="text-xs text-slate-500">
                  Shipping Cost: {shipment.cost ? formatCurrency(shipment.cost) : "Calculated at checkout"}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Fulfillment Schedule
                </span>
                <p className="text-xs text-slate-700 font-medium">
                  <span className="font-bold">Shipped:</span>{" "}
                  {shipment.shipped_at ? formatDate(shipment.shipped_at) : "Pending dispatch"}
                </p>
                <p className="text-xs text-slate-700 font-medium">
                  <span className="font-bold">Est. Delivery:</span>{" "}
                  {shipment.estimated_delivery || "Calculating..."}
                </p>
                {shipment.delivered_at && (
                  <p className="text-xs text-emerald-700 font-bold">
                    Delivered: {formatDate(shipment.delivered_at)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Live Tracking Events Timeline */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Truck className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Tracking Event Timeline</h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {shipment.tracking_events?.length || 0} Events
              </span>
            </div>

            {!shipment.tracking_events || shipment.tracking_events.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                No tracking scan events recorded for this shipment yet.
              </div>
            ) : (
              <div className="space-y-6 border-l-2 border-blue-100 ml-3 pl-5 py-2">
                {shipment.tracking_events.map((event, index) => {
                  const isLatest = index === 0;
                  return (
                    <div key={event.id} className="relative">
                      <div
                        className={`absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          isLatest ? "bg-blue-600 ring-4 ring-blue-100" : "bg-slate-300"
                        }`}
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 uppercase">
                            {event.status.replace(/_/g, " ")}
                          </span>
                          {event.location && (
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-slate-400" aria-hidden="true" />
                              {event.location}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatDate(event.occurred_at)}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-slate-600 mt-1">{event.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Linked Commercial Order Card */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Linked Commercial Order</h2>
              </div>
              <Link href={`/admin/orders/${shipment.order_id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <span>View Order</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Order Number
                </span>
                <p className="font-extrabold text-slate-900 font-mono text-sm">
                  {shipment.order_number || shipment.order?.order_number || `ORD-${shipment.order_id.substring(0, 8)}`}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Order Status
                </span>
                <p className="font-extrabold text-slate-900 uppercase">
                  {shipment.order?.status || "Confirmed"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Order Value
                </span>
                <p className="font-extrabold text-emerald-700 text-sm">
                  {shipment.order?.total_amount
                    ? formatCurrency(shipment.order.total_amount, shipment.order.currency_code)
                    : "Included"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Warehouse & Delivery Destination */}
        <div className="space-y-6">
          {/* Warehouse Origin Card */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <Building2 className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Fulfillment Origin</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Warehouse
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {shipment.warehouse_name || shipment.warehouse?.name || "Main Distribution Warehouse"}
                </p>
                {shipment.warehouse?.code && (
                  <p className="font-mono text-slate-500 text-[11px] mt-0.5">Code: {shipment.warehouse.code}</p>
                )}
              </div>

              {shipment.warehouse?.contact_email && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Contact Email
                  </span>
                  <p className="text-slate-700 font-medium">{shipment.warehouse.contact_email}</p>
                </div>
              )}

              {shipment.warehouse?.contact_phone && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Contact Phone
                  </span>
                  <p className="text-slate-700 font-medium">{shipment.warehouse.contact_phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer & Delivery Destination Card */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Customer &amp; Destination</h2>
              </div>
              {shipment.order?.user?.id && (
                <Link href={`/admin/customers/${shipment.order.user.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] font-bold text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <span>Profile</span>
                  </Button>
                </Link>
              )}
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Recipient
                </span>
                <p className="font-extrabold text-slate-900 text-sm">
                  {shipment.order?.user
                    ? `${shipment.order.user.first_name} ${shipment.order.user.last_name}`
                    : "Customer on file"}
                </p>
                {shipment.order?.user?.email && (
                  <p className="text-slate-500 mt-0.5">{shipment.order.user.email}</p>
                )}
                {shipment.order?.user?.phone && (
                  <p className="text-slate-500">{shipment.order.user.phone}</p>
                )}
              </div>

              {shipment.order?.shipping_address && (
                <div className="pt-3 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-blue-600" aria-hidden="true" /> Shipping Address
                  </span>
                  <p className="font-semibold text-slate-900">{shipment.order.shipping_address.address_line_1}</p>
                  {shipment.order.shipping_address.address_line_2 && (
                    <p className="text-slate-600">{shipment.order.shipping_address.address_line_2}</p>
                  )}
                  <p className="text-slate-700">
                    {shipment.order.shipping_address.city}, {shipment.order.shipping_address.state}{" "}
                    {shipment.order.shipping_address.postal_code}
                  </p>
                  <p className="font-mono text-[11px] text-slate-400">
                    {shipment.order.shipping_address.country_code}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3. UPDATE STATUS DIALOG                                                 */}
      {/* ======================================================================= */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <DialogTitle className="text-lg font-black text-slate-900">
                Update Shipment Status
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Advance the fulfillment lifecycle and log a tracking scan event.
            </DialogDescription>
          </DialogHeader>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleStatusSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="shipment-status-select" className="text-xs font-bold text-slate-700">
                Target Status
              </label>
              <select
                id="shipment-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
              >
                <option value="pending">Pending</option>
                <option value="label_created">Label Created</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="shipment-location-input" className="text-xs font-bold text-slate-700">
                Scan Location <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <Input
                id="shipment-location-input"
                type="text"
                placeholder="e.g. Lagos Distribution Hub"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="shipment-notes-input" className="text-xs font-bold text-slate-700">
                Event Description / Notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <Input
                id="shipment-notes-input"
                type="text"
                placeholder="e.g. Dispatched on delivery vehicle"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStatusModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateStatusMutation.isPending}
                className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {updateStatusMutation.isPending ? "Updating..." : "Submit Transition"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Terminal / High Impact Transitions */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={`Confirm status change to ${selectedStatus.toUpperCase()}?`}
        description={`This will transition shipment ${shipment.tracking_number || shipment.id} to ${selectedStatus.toUpperCase()} and advance linked order status if applicable.`}
        confirmText="Confirm Transition"
        variant={selectedStatus === "failed" ? "danger" : "default"}
        isLoading={updateStatusMutation.isPending}
        onConfirm={executeStatusUpdate}
      />
    </div>
  );
}
