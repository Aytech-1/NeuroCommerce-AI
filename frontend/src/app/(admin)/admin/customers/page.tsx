"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Users,
  Eye,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  UserCheck,
  Building2,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { useUsers, useUpdateUserStatus } from "@/hooks/use-users";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<string>("");
  const [customerToDeactivate, setCustomerToDeactivate] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading, isError, refetch } = useUsers({
    page,
    per_page: 15,
    user_type: "customer",
    search: search.trim() || undefined,
    is_active: isActive !== "" ? isActive : undefined,
  });

  const updateStatusMutation = useUpdateUserStatus();

  const handleToggleStatus = async (id: string, currentStatus: boolean, name?: string) => {
    if (currentStatus) {
      // Disabling active customer -> confirm
      setCustomerToDeactivate({ id, name: name || "this customer" });
      return;
    }

    // Activating disabled customer -> direct action
    try {
      await updateStatusMutation.mutateAsync({ id, isActive: true });
      toast.success("Customer account activated.");
    } catch {
      toast.error("Failed to activate customer account.");
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!customerToDeactivate) return;
    try {
      await updateStatusMutation.mutateAsync({ id: customerToDeactivate.id, isActive: false });
      toast.success("Customer account deactivated.");
      setCustomerToDeactivate(null);
    } catch {
      toast.error("Failed to deactivate customer account.");
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName?.[0] || "";
    const l = lastName?.[0] || "";
    return (f + l).toUpperCase() || "CU";
  };

  const totalCustomers = data?.meta?.total ?? data?.data?.length ?? 0;
  const activeCount = data?.data?.filter((c) => c.is_active).length ?? 0;
  const verifiedCount = data?.data?.filter((c) => c.email_verified_at).length ?? 0;

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
            Customers
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              CUSTOMER MANAGEMENT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Customers
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage customer accounts, purchasing relationships, account activity, and customer information from one secure workspace.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. CUSTOMER KPI SUMMARY ROW                                             */}
      {/* ======================================================================= */}
      {data?.data && data.data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Customers
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalCustomers} Customers
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Accounts
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {activeCount} Active
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Verified Profiles
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {verifiedCount} Verified
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Intelligence State
            </span>
            <span className="text-xs font-extrabold text-emerald-700 mt-2 block">
              Synchronized
            </span>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. FILTER TOOLBAR                                                       */}
      {/* ======================================================================= */}
      <div className="p-4 sm:p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by name, email, or phone..."
              prefixIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
              <Filter className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Filters:</span>
            </div>

            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Statuses</option>
              <option value="1">Active Accounts</option>
              <option value="0">Disabled Accounts</option>
            </select>

            {(search || isActive !== "") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setIsActive("");
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
      {/* 4. CUSTOMERS TABLE / DATA VIEW                                          */}
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
          <h3 className="text-base font-extrabold text-slate-900">Failed to load customer directory</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to communicate with the customer intelligence service.
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
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Group</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Registered</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs border border-blue-100/80 shadow-2xs">
                          {getInitials(customer.first_name, customer.last_name)}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="font-extrabold text-xs text-slate-900 hover:text-blue-600 block truncate transition-colors"
                          >
                            {customer.full_name}
                          </Link>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            {customer.email}
                            {customer.email_verified_at && (
                              <span title="Email Verified">
                                <ShieldCheck className="h-3 w-3 text-emerald-600" aria-label="Email verified" />
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                      {customer.phone || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                        {customer.profile?.customer_group || "Regular"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {customer.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          <XCircle className="h-3 w-3" aria-hidden="true" />
                          <span>Disabled</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/admin/customers/${customer.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>View</span>
                          </Button>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(customer.id, customer.is_active, customer.full_name)}
                          className="h-8 px-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          {customer.is_active ? "Disable" : "Enable"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
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
          icon={Users}
          title={search || isActive !== "" ? "No Matching Customers" : "No Customers Found"}
          description={
            search || isActive !== ""
              ? "No customers matched your filter query."
              : "No customer accounts have registered in the storefront yet."
          }
        />
      )}

      <ConfirmDialog
        open={!!customerToDeactivate}
        onOpenChange={(open) => {
          if (!open) setCustomerToDeactivate(null);
        }}
        title="Deactivate this customer account?"
        description={`This will suspend account access and prevent ${customerToDeactivate?.name} from logging into the storefront until re-enabled.`}
        confirmText="Deactivate Customer"
        variant="danger"
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
}
