"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Mail,
  Phone,
  Building,
  Briefcase,
  CheckCircle2,
  XCircle,
  Key,
  ChevronRight,
  Sparkles,
  UserCheck,
  Calendar,
  History,
  Edit,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate } from "@/lib/utils";
import { useUser, useUpdateUserStatus, useRoles, useAssignUserRoles } from "@/hooks/use-users";
import { toast } from "sonner";

export default function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: staff, isLoading, isError } = useUser(id);
  const { data: rolesData } = useRoles();
  const updateStatusMutation = useUpdateUserStatus();
  const assignRolesMutation = useAssignUserRoles();

  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isRoleConfirmOpen, setIsRoleConfirmOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleToggleStatus = async () => {
    if (!staff) return;

    if (staff.is_active) {
      // Disabling active account -> confirm
      setIsDeactivateConfirmOpen(true);
      return;
    }

    // Activating disabled account -> direct action
    try {
      await updateStatusMutation.mutateAsync({
        id: staff.id,
        isActive: true,
      });
      toast.success("Staff account activated.");
    } catch {
      toast.error("Failed to activate staff account.");
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!staff) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: staff.id,
        isActive: false,
      });
      toast.success("Staff account deactivated.");
      setIsDeactivateConfirmOpen(false);
    } catch {
      toast.error("Failed to deactivate staff account.");
    }
  };

  const handleOpenRoleDialog = () => {
    if (!staff) return;
    setSelectedRoles(staff.roles || []);
    setIsRoleDialogOpen(true);
  };

  const handleToggleRoleSelection = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    );
  };

  const handleSaveRoles = () => {
    setIsRoleConfirmOpen(true);
  };

  const handleConfirmSaveRoles = async () => {
    if (!staff) return;
    try {
      await assignRolesMutation.mutateAsync({
        id: staff.id,
        roles: selectedRoles,
      });
      toast.success(`Roles updated for "${staff.full_name}".`);
      setIsRoleConfirmOpen(false);
      setIsRoleDialogOpen(false);
    } catch {
      toast.error("Failed to update staff roles.");
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

  if (isError || !staff) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
          <Shield className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Staff Member Not Found</h2>
        <p className="text-xs text-slate-500">The requested staff profile could not be loaded.</p>
        <Link href="/admin/staff">
          <Button variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Back to Staff Roster
          </Button>
        </Link>
      </div>
    );
  }

  const allRolesList = Array.isArray(rolesData) ? rolesData : [];

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
          <Link href="/admin/staff" className="hover:text-blue-600 transition-colors">
            Staff
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold truncate max-w-xs" aria-current="page">
            {staff.full_name}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 font-extrabold text-base border border-blue-100 shadow-2xs">
              {staff.first_name[0]}
              {staff.last_name[0]}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
                STAFF PROFILE
              </span>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {staff.full_name}
                </h1>
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
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Employee ID: <span className="font-mono text-slate-700 font-bold">{staff.profile?.employee_id || "N/A"}</span> • Onboarded on {formatDate(staff.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/admin/staff">
              <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold shadow-2xs">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </Button>
            </Link>
            <Link href={`/admin/audit-logs?user_id=${staff.id}`}>
              <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold shadow-2xs">
                <History className="h-4 w-4" aria-hidden="true" />
                <span>Audit Trail</span>
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleToggleStatus}
              isLoading={updateStatusMutation.isPending}
              className={`h-10 px-4 text-xs font-bold rounded-xl shadow-xs ${
                staff.is_active
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {staff.is_active ? "Disable Account" : "Activate Account"}
            </Button>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. DETAIL GRID                                                          */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Identity, Organization & Roles */}
        <div className="space-y-6 md:col-span-2">
          {/* Identity & Contact */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Employee Identity &amp; Access</h2>
              </div>
            </div>

            <div className="space-y-3.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> Work Email:
                </span>
                <span className="font-extrabold text-slate-900">{staff.email}</span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> Phone:
                </span>
                <span className="font-semibold text-slate-700">
                  {staff.phone || "None on record"}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> Department:
                </span>
                <span className="font-semibold text-slate-700">
                  {staff.profile?.department || "Operations"}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> Position:
                </span>
                <span className="font-semibold text-slate-700">
                  {staff.profile?.position || "Specialist"}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Roles & Security Boundaries */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <span>Assigned Roles &amp; Security Boundaries</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  RBAC roles determining granted permissions.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenRoleDialog}
                className="h-8 px-3 gap-1 text-xs font-bold rounded-lg hover:bg-blue-50 hover:text-blue-700"
              >
                <Edit className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Assign Roles</span>
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-2">
                  Active Roles
                </span>
                <div className="flex flex-wrap gap-2">
                  {staff.roles && staff.roles.length > 0 ? (
                    staff.roles.map((r) => (
                      <span
                        key={r}
                        className="text-xs font-extrabold uppercase px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        {r.replace("_", " ")}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                      {staff.user_type}
                    </span>
                  )}
                </div>
              </div>

              {/* Effective Permissions */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-2">
                  Effective Permissions ({staff.permissions?.length || 0})
                </span>
                {staff.permissions && staff.permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {staff.permissions.map((p) => (
                      <span
                        key={p}
                        className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No individual permissions resolved.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Security Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Account Security</h2>
            </div>

            <div className="space-y-3.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">Access Level:</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {staff.user_type}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium">Last Login:</span>
                <span className="font-semibold text-slate-700">
                  {staff.last_login_at ? formatDate(staff.last_login_at) : "Never"}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium">Authentication:</span>
                <span className="font-extrabold text-emerald-700">Sanctum Token</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Assignment Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="rounded-[20px] bg-white border border-slate-200/90 shadow-xl max-w-lg">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Manage Roles: {staff.full_name}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Select the administrative roles assigned to this staff account.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2 max-h-64 overflow-y-auto">
            {allRolesList.map((role) => {
              const isChecked = selectedRoles.includes(role.name);
              return (
                <label
                  key={role.id}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs transition-all cursor-pointer select-none ${
                    isChecked
                      ? "bg-blue-50/70 border-blue-200 text-blue-900 font-semibold"
                      : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleRoleSelection(role.name)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold capitalize">{role.name.replace("_", " ")}</span>
                    {role.description && (
                      <span className="text-[11px] text-slate-400 block">{role.description}</span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          <DialogFooter className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
              className="h-10 px-4 text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveRoles}
              isLoading={assignRolesMutation.isPending}
              className="h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Save Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation */}
      <ConfirmDialog
        open={isRoleConfirmOpen}
        onOpenChange={setIsRoleConfirmOpen}
        title="Update staff roles?"
        description={`You are modifying role assignments for ${staff.full_name}. This will immediately change their access privileges across the admin console.`}
        confirmText="Confirm Role Change"
        variant="warning"
        isLoading={assignRolesMutation.isPending}
        onConfirm={handleConfirmSaveRoles}
      />

      {/* Account Deactivate Confirmation */}
      <ConfirmDialog
        open={isDeactivateConfirmOpen}
        onOpenChange={setIsDeactivateConfirmOpen}
        title="Deactivate this staff account?"
        description={`This will prevent ${staff.full_name} from accessing the administrative workspace until re-enabled.`}
        confirmText="Deactivate Account"
        variant="danger"
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
}
