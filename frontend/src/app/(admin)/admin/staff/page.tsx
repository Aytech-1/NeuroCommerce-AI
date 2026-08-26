"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronRight,
  Filter,
  AlertCircle,
  Building,
  Mail,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Can } from "@/components/ui/can";
import { formatDate } from "@/lib/utils";
import { useUsers, useUpdateUserStatus } from "@/hooks/use-users";
import { toast } from "sonner";

export default function AdminStaffPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<string>("");
  const [staffToDeactivate, setStaffToDeactivate] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading, isError, refetch } = useUsers({
    page,
    per_page: 15,
    user_type: "staff",
    search: search.trim() || undefined,
  });

  const updateStatusMutation = useUpdateUserStatus();

  const handleToggleStatus = async (id: string, currentStatus: boolean, name?: string) => {
    if (currentStatus) {
      // Disabling active account -> confirm
      setStaffToDeactivate({ id, name: name || "this staff member" });
      return;
    }

    // Activating disabled account -> direct action
    try {
      await updateStatusMutation.mutateAsync({ id, isActive: true });
      toast.success("Staff account activated.");
    } catch {
      toast.error("Failed to activate staff account.");
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!staffToDeactivate) return;
    try {
      await updateStatusMutation.mutateAsync({ id: staffToDeactivate.id, isActive: false });
      toast.success("Staff account deactivated.");
      setStaffToDeactivate(null);
    } catch {
      toast.error("Failed to deactivate staff account.");
    }
  };

  const totalStaff = data?.meta?.total ?? data?.data?.length ?? 0;
  const filteredData = data?.data?.filter((s) => {
    if (isActive === "1") return s.is_active;
    if (isActive === "0") return !s.is_active;
    return true;
  });
  const activeCount = data?.data?.filter((s) => s.is_active).length ?? 0;
  const disabledCount = data?.data?.filter((s) => !s.is_active).length ?? 0;

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
            Staff
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              STAFF MANAGEMENT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Staff &amp; Administrative Team
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage authorized NeuroCommerce administrators and their access to the administrative workspace.
            </p>
          </div>

          <Can permission="user.create">
            <Link href="/admin/staff/create">
              <Button className="h-10 px-4 gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-xs">
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Add Staff Member</span>
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. STAFF KPI SUMMARY ROW                                                */}
      {/* ======================================================================= */}
      {data?.data && data.data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Staff
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalStaff} Members
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Accounts
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {activeCount} Active
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Disabled Accounts
            </span>
            <span className="text-xl font-extrabold text-slate-600 mt-1 block">
              {disabledCount} Disabled
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Security Posture
            </span>
            <span className="text-xs font-extrabold text-emerald-700 mt-2 block">
              Live &amp; Verified
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
              placeholder="Search by name, email, or employee ID..."
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
              <option value="1">Active</option>
              <option value="0">Disabled</option>
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
      {/* 4. STAFF ROSTER TABLE                                                   */}
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
          <h3 className="text-base font-extrabold text-slate-900">Failed to load staff roster</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to communicate with the user management service.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Retry Loading
          </Button>
        </div>
      ) : filteredData && filteredData.length > 0 ? (
        <div className="rounded-[20px] bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="py-3.5 px-6">Staff Member</th>
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Onboarded</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100 shadow-2xs">
                          {staff.first_name[0]}
                          {staff.last_name[0]}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/staff/${staff.id}`}
                            className="font-extrabold text-xs text-slate-900 hover:text-blue-600 block truncate"
                          >
                            {staff.full_name}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-medium block truncate">
                            {staff.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-semibold">
                      {staff.profile?.employee_id || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-semibold">
                      {staff.profile?.department || "Operations"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {staff.roles && staff.roles.length > 0 ? (
                          staff.roles.map((r) => (
                            <span
                              key={r}
                              className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {r.replace("_", " ")}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                            {staff.user_type}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {staff.is_active ? (
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
                      {formatDate(staff.created_at)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/staff/${staff.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>View</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(staff.id, staff.is_active, staff.full_name)}
                          className={`h-8 px-2.5 text-xs font-bold rounded-lg ${
                            staff.is_active
                              ? "text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                              : "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                          }`}
                        >
                          {staff.is_active ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {data?.meta && (
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
          icon={Shield}
          title="No Staff Accounts"
          description="Add employees or administrators to manage operations."
          actionLabel="Add Staff Member"
          onAction={() => {
            window.location.href = "/admin/staff/create";
          }}
        />
      )}

      <ConfirmDialog
        open={!!staffToDeactivate}
        onOpenChange={(open) => {
          if (!open) setStaffToDeactivate(null);
        }}
        title="Deactivate this staff account?"
        description={`This will prevent ${staffToDeactivate?.name} from accessing the administrative workspace until re-enabled.`}
        confirmText="Deactivate Staff"
        variant="danger"
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
}
