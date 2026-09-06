"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Truck,
  Search,
  Filter,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Building2,
  Eye,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useShipments, useWarehouses } from "@/hooks/use-shipping";
import { ShipmentItem, WarehouseItem } from "@/services/shipping-service";

export default function AdminShipmentsPage() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [carrier, setCarrier] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  const { data, isLoading, isError, refetch } = useShipments({
    page,
    per_page: perPage,
    search: search.trim() || undefined,
    status: status || undefined,
    carrier: carrier || undefined,
    warehouse_id: warehouseId || undefined,
  });

  const { data: warehouses } = useWarehouses();

  // Status Badge Component matching authoritative ShipmentStatus enum
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

  const getCarrierBadge = (carrierName: string) => {
    const formatted = carrierName?.toUpperCase() || "CARRIER";
    const colors: Record<string, string> = {
      UPS: "bg-amber-50 text-amber-900 border-amber-300",
      FEDEX: "bg-purple-50 text-purple-700 border-purple-200",
      DHL: "bg-yellow-50 text-yellow-800 border-yellow-300",
      USPS: "bg-blue-50 text-blue-800 border-blue-200",
      MOCK_CARRIER: "bg-slate-100 text-slate-700 border-slate-200",
    };
    return (
      <span
        className={`inline-flex items-center text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
          colors[formatted] || "bg-slate-50 text-slate-700 border-slate-200"
        }`}
      >
        {carrierName?.replace(/_/g, " ")}
      </span>
    );
  };

  // Metrics calculation
  const totalShipments = data?.meta?.total || data?.data?.length || 0;
  const inTransitCount = data?.data?.filter((s: ShipmentItem) =>
    ["in_transit", "out_for_delivery", "picked_up"].includes(s.status)
  ).length || 0;
  const deliveredCount = data?.data?.filter((s: ShipmentItem) => s.status === "delivered").length || 0;
  const pendingCount = data?.data?.filter((s: ShipmentItem) => ["pending", "label_created"].includes(s.status)).length || 0;

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
          <span className="text-slate-900 font-bold" aria-current="page">
            Shipments &amp; Fulfillment
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-sm border border-blue-100 shadow-2xs">
              <Truck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
                LOGISTICS &amp; FULFILLMENT
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Shipment Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Monitor carrier dispatches, warehouse routing, live tracking, and fulfillment lifecycles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. SUMMARY METRIC CARDS                                                 */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Shipments</span>
            <Package className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black tracking-tight text-slate-900">{totalShipments}</p>
          <p className="text-[11px] text-slate-400 font-medium">Logged shipment dispatches</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">In Transit</span>
            <Truck className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black tracking-tight text-blue-700">{inTransitCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">Active carrier routing</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black tracking-tight text-emerald-700">{deliveredCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">Successfully completed</p>
        </div>

        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Label Created / Pending</span>
            <Clock className="h-4 w-4 text-amber-600" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black tracking-tight text-amber-700">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 font-medium">Awaiting carrier pickup</p>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3. FILTER TOOLBAR                                                       */}
      {/* ======================================================================= */}
      <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input
              type="text"
              placeholder="Search by Tracking # or Order #..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-10 h-10 text-xs font-medium rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Filter className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Filter:</span>
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="label_created">Label Created</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="returned">Returned</option>
            </select>

            <select
              value={carrier}
              onChange={(e) => {
                setCarrier(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Carriers</option>
              <option value="ups">UPS</option>
              <option value="fedex">FedEx</option>
              <option value="dhl">DHL</option>
              <option value="usps">USPS</option>
              <option value="mock_carrier">Mock Carrier</option>
            </select>

            {warehouses && warehouses.length > 0 && (
              <select
                value={warehouseId}
                onChange={(e) => {
                  setWarehouseId(e.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w: WarehouseItem) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            )}

            {(search || status || carrier || warehouseId) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setCarrier("");
                  setWarehouseId("");
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
      {/* 4. SHIPMENTS TABLE                                                      */}
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
          <h3 className="text-base font-extrabold text-slate-900">Failed to load shipment records</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            An error occurred while fetching shipping logistics data from the Laravel backend.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-xl mt-2">
            Retry Loading
          </Button>
        </div>
      ) : !data || data.data.length === 0 ? (
        <div className="p-12 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 mx-auto">
            <Truck className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No shipments found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {search || status || carrier || warehouseId
                ? "No shipment records matched your active filter criteria."
                : "No orders have been dispatched or fulfilled yet."}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-[20px] bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Tracking Number &amp; ID</th>
                  <th className="py-3.5 px-4">Linked Order</th>
                  <th className="py-3.5 px-4">Carrier &amp; Service</th>
                  <th className="py-3.5 px-4">Warehouse</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Shipped / Created</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((shipment: ShipmentItem) => (
                  <tr key={shipment.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/shipments/${shipment.id}`}
                          className="font-mono font-extrabold text-xs text-blue-700 hover:text-blue-800 transition-colors block"
                        >
                          {shipment.tracking_number || shipment.id.substring(0, 18)}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-medium block truncate mt-0.5">
                          ID: {shipment.id}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <Link
                          href={`/admin/orders/${shipment.order_id}`}
                          className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors block font-mono"
                        >
                          {shipment.order_number || shipment.order?.order_number || `ORD-${shipment.order_id.substring(0, 8)}`}
                        </Link>
                        {shipment.order?.user && (
                          <span className="text-[11px] text-slate-500 font-medium block truncate">
                            {shipment.order.user.first_name} {shipment.order.user.last_name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {getCarrierBadge(shipment.carrier)}
                        {shipment.service_level && (
                          <span className="text-[11px] text-slate-500 block font-medium capitalize">
                            {shipment.service_level}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                        <span className="truncate">{shipment.warehouse_name || shipment.warehouse?.name || "Main Warehouse"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(shipment.status)}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                      {shipment.shipped_at ? formatDate(shipment.shipped_at) : formatDate(shipment.created_at)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {shipment.label_url && (
                          <a
                            href={shipment.label_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                            title="View Shipping Label"
                          >
                            <FileText className="h-4 w-4" aria-hidden="true" />
                          </a>
                        )}
                        <Link href={`/admin/shipments/${shipment.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>View</span>
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {data.meta && (data.meta.last_page ?? 1) > 1 && (
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
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
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
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
