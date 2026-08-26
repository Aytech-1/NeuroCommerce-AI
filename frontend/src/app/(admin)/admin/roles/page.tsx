"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Shield,
  Key,
  CheckCircle2,
  Lock,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
  Sparkles,
  Check,
  CheckCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useRoles, usePermissions, useSyncRolePermissions } from "@/hooks/use-users";
import { RoleItem, PermissionItem } from "@/services/user-service";
import { toast } from "sonner";

export default function AdminRolesPage() {
  const { data: roles, isLoading: isRolesLoading, isError: isRolesError, refetch } = useRoles();
  const { data: permissions, isLoading: isPermissionsLoading } = usePermissions();
  const syncPermissionsMutation = useSyncRolePermissions();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmPermsOpen, setIsConfirmPermsOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [permSearch, setPermSearch] = useState("");

  const flatPermissionsList: PermissionItem[] = useMemo(() => {
    if (!permissions) return [];
    if (Array.isArray(permissions)) return permissions;
    if (typeof permissions === "object") {
      return Object.values(permissions).flat() as PermissionItem[];
    }
    return [];
  }, [permissions]);

  const rolesList: RoleItem[] = useMemo(() => {
    if (!roles) return [];
    if (Array.isArray(roles)) return roles;
    if (typeof roles === "object") {
      return Object.values(roles).flat() as RoleItem[];
    }
    return [];
  }, [roles]);

  const handleOpenPermissionDialog = (role: RoleItem) => {
    setSelectedRole(role);
    const initialPerms = Array.isArray(role.permissions)
      ? role.permissions.map((p) => (typeof p === "string" ? p : p.name))
      : [];
    setSelectedPermissions(initialPerms);
    setPermSearch("");
    setIsDialogOpen(true);
  };

  const handleTogglePermission = (permName: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
    );
  };

  const handleSelectAll = () => {
    if (flatPermissionsList.length === 0) return;
    setSelectedPermissions(flatPermissionsList.map((p) => p.name));
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    setIsConfirmPermsOpen(true);
  };

  const handleConfirmSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      await syncPermissionsMutation.mutateAsync({
        id: selectedRole.id,
        permissions: selectedPermissions,
      });
      toast.success(`Permissions synchronized for role "${selectedRole.name}".`);
      setIsConfirmPermsOpen(false);
      setIsDialogOpen(false);
    } catch {
      toast.error("Failed to sync role permissions.");
    }
  };

  const filteredRoles = rolesList.filter((role) => {
    const matchesSearch =
      !search ||
      role.name.toLowerCase().includes(search.toLowerCase()) ||
      (role.description && role.description.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter =
      !filterType ||
      (filterType === "system" && role.is_system) ||
      (filterType === "custom" && !role.is_system);

    return matchesSearch && matchesFilter;
  });

  const totalRoles = rolesList.length;
  const systemRolesCount = rolesList.filter((r) => r.is_system).length;
  const customRolesCount = rolesList.filter((r) => !r.is_system).length;
  const totalPermissionsCount = flatPermissionsList.length;

  const filteredPermissions = flatPermissionsList.filter((p) =>
    !permSearch || p.name.toLowerCase().includes(permSearch.toLowerCase())
  );

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
            Roles &amp; RBAC
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              ACCESS GOVERNANCE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Roles &amp; Permissions Matrix
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure role-based access control (RBAC), operational boundaries, and system privileges.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. KPI SUMMARY ROW                                                      */}
      {/* ======================================================================= */}
      {roles && roles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Roles
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalRoles} Roles
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              System Roles
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {systemRolesCount} Protected
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Custom Roles
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {customRolesCount} Custom
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Registered Permissions
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalPermissionsCount} Privileges
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
              placeholder="Search roles by name or description..."
              prefixIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
              <Filter className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Filters:</span>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Roles</option>
              <option value="system">System Roles</option>
              <option value="custom">Custom Roles</option>
            </select>

            {(search || filterType) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilterType("");
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
      {/* 4. ROLES CARDS GRID                                                     */}
      {/* ======================================================================= */}
      {isRolesLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-56 rounded-[20px]" />
          ))}
        </div>
      ) : isRolesError ? (
        <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-rose-200 shadow-2xs text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Failed to load system roles</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to communicate with the authorization governance engine.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Retry Loading
          </Button>
        </div>
      ) : filteredRoles && filteredRoles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map((role) => {
            const permCount = role.permissions_count ?? (Array.isArray(role.permissions) ? role.permissions.length : 0);

            return (
              <div
                key={role.id}
                className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 shadow-2xs">
                        <Shield className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <h2 className="text-base font-extrabold text-slate-900 capitalize">
                        {role.name.replace("_", " ")}
                      </h2>
                    </div>
                    {role.is_system && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                        <span>System</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {role.description || `Configured system access role for ${role.name}.`}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> Granted Privileges:
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {permCount} permissions
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-10 text-xs font-bold rounded-xl shadow-2xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                    onClick={() => handleOpenPermissionDialog(role)}
                  >
                    Configure Permissions
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Shield}
          title="No Roles Found"
          description="System roles have not been seeded or configured."
        />
      )}

      {/* ======================================================================= */}
      {/* 5. PERMISSION MATRIX CONFIGURATION DIALOG                                */}
      {/* ======================================================================= */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[20px] bg-white border border-slate-200/90 shadow-xl max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <DialogTitle className="text-base font-extrabold text-slate-900 capitalize">
                Configure Permissions: {selectedRole?.name.replace("_", " ")}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Assign or revoke fine-grained system privileges for this role.
            </DialogDescription>
          </DialogHeader>

          {/* Dialog Toolbar */}
          <div className="py-2.5 flex items-center justify-between gap-3 border-b border-slate-100">
            <div className="flex-1 max-w-xs">
              <Input
                placeholder="Search permissions..."
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                className="h-8 text-xs rounded-lg bg-slate-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-extrabold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-extrabold text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-2 pr-1">
            {isPermissionsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredPermissions && filteredPermissions.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filteredPermissions.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm.name);
                  return (
                    <label
                      key={perm.id}
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs transition-all cursor-pointer select-none ${
                        isChecked
                          ? "bg-blue-50/70 border-blue-200 text-blue-900 font-semibold"
                          : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTogglePermission(perm.name)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-mono text-[11px] truncate" title={perm.name}>
                        {perm.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No permissions registered in backend registry.
              </p>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 pt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              {selectedPermissions.length} permissions assigned
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="h-10 px-4 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSavePermissions}
                isLoading={syncPermissionsMutation.isPending}
                className="h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Save Permissions
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isConfirmPermsOpen}
        onOpenChange={setIsConfirmPermsOpen}
        title="Update role permissions?"
        description={`You are modifying permission grants for the "${selectedRole?.name}" role (${selectedPermissions.length} permissions assigned). These changes may affect administrative capabilities for members of this role.`}
        confirmText="Update Permissions"
        variant="warning"
        isLoading={syncPermissionsMutation.isPending}
        onConfirm={handleConfirmSavePermissions}
      />
    </div>
  );
}
