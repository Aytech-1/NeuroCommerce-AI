"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CreditCard,
  ChevronRight,
  ShoppingBag,
  Clock,
  Shield,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useUser, useUpdateUserStatus } from "@/hooks/use-users";
import { toast } from "sonner";

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: customer, isLoading, isError } = useUser(id);
  const updateStatusMutation = useUpdateUserStatus();
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);

  const handleToggleStatus = async () => {
    if (!customer) return;

    if (customer.is_active) {
      // Disabling active customer -> confirm
      setIsDeactivateConfirmOpen(true);
      return;
    }

    // Activating disabled customer -> direct action
    try {
      await updateStatusMutation.mutateAsync({
        id: customer.id,
        isActive: true,
      });
      toast.success("Customer account activated.");
    } catch {
      toast.error("Failed to activate customer account.");
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!customer) return;
    try {
      await updateStatusMutation.mutateAsync({
        id: customer.id,
        isActive: false,
      });
      toast.success("Customer account deactivated.");
      setIsDeactivateConfirmOpen(false);
    } catch {
      toast.error("Failed to deactivate customer account.");
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

  if (isError || !customer) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
          <User className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Customer Not Found</h2>
        <p className="text-xs text-slate-500">The customer record does not exist or has been removed.</p>
        <Link href="/admin/customers">
          <Button variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Back to Customers
          </Button>
        </Link>
      </div>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName?.[0] || "";
    const l = lastName?.[0] || "";
    return (f + l).toUpperCase() || "CU";
  };

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
          <Link href="/admin/customers" className="hover:text-blue-600 transition-colors">
            Customers
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            {customer.full_name}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-sm border border-blue-100 shadow-2xs">
              {getInitials(customer.first_name, customer.last_name)}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
                CUSTOMER 360 INTELLIGENCE
              </span>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {customer.full_name}
                </h1>
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
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Customer ID: {customer.id} • Registered on {formatDate(customer.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/admin/customers">
              <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold shadow-2xs">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </Button>
            </Link>
            <Button
              variant={customer.is_active ? "destructive" : "primary"}
              size="sm"
              onClick={handleToggleStatus}
              isLoading={updateStatusMutation.isPending}
              className="h-10 px-4 text-xs font-bold rounded-xl shadow-xs"
            >
              {customer.is_active ? "Disable Account" : "Activate Account"}
            </Button>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. CUSTOMER 360 GRID                                                    */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Identity & Addresses */}
        <div className="space-y-6 md:col-span-2">
          {/* Identity & Account State */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Profile Overview</h2>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {customer.profile?.customer_group || "Regular Customer"}
              </span>
            </div>

            <div className="space-y-3.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> Email:
                </span>
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  {customer.email}
                  {customer.email_verified_at && (
                    <span title="Email Verified">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-label="Email verified" />
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> Phone:
                </span>
                <span className="font-bold text-slate-900">
                  {customer.phone || "None provided"}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium">Customer Group:</span>
                <span className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {customer.profile?.customer_group || "Regular"}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium">Last Active / Login:</span>
                <span className="text-slate-700 font-medium">
                  {customer.last_login_at ? formatDate(customer.last_login_at) : "Never"}
                </span>
              </div>
            </div>
          </div>

          {/* Stored Addresses */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <MapPin className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Customer Addresses</h2>
            </div>

            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {customer.addresses.map((addr, idx) => (
                  <div
                    key={addr.id || idx}
                    className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-4 text-xs space-y-1.5"
                  >
                    <div className="font-extrabold text-slate-900 mb-1 flex items-center justify-between">
                      <span>
                        {addr.first_name} {addr.last_name}
                      </span>
                      {addr.is_default && (
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 font-medium">{addr.address_line_1}</p>
                    {addr.address_line_2 && (
                      <p className="text-slate-600">{addr.address_line_2}</p>
                    )}
                    <p className="text-slate-600 font-medium">
                      {addr.city}, {addr.state} {addr.postal_code}
                    </p>
                    <p className="text-slate-400 font-mono text-[10px] uppercase font-bold">{addr.country_code}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-2">No customer delivery addresses saved yet.</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Commercial Telemetry & Security */}
        <div className="space-y-6">
          {/* Commercial Metrics */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Commercial Metrics</h2>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium">Lifetime Spend:</span>
                <span className="font-extrabold text-base text-blue-600">
                  {formatCurrency(customer.profile?.total_spent ?? 0)}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium">Total Orders:</span>
                <span className="font-extrabold text-slate-900">
                  {customer.profile?.total_orders ?? 0}
                </span>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Shield className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Account Security</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Verification:</span>
                <span className={customer.email_verified_at ? "font-bold text-emerald-700" : "font-bold text-amber-600"}>
                  {customer.email_verified_at ? "Email Verified" : "Unverified Email"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Account Status:</span>
                <span className={customer.is_active ? "font-bold text-emerald-700" : "font-bold text-slate-600"}>
                  {customer.is_active ? "Active" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Access Tier:</span>
                <span className="font-bold text-slate-800 uppercase text-[10px]">
                  {customer.user_type || "Customer"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isDeactivateConfirmOpen}
        onOpenChange={setIsDeactivateConfirmOpen}
        title="Deactivate this customer account?"
        description={`This will suspend account access and prevent ${customer.full_name} from logging into the storefront until re-enabled.`}
        confirmText="Deactivate Customer"
        variant="danger"
        isLoading={updateStatusMutation.isPending}
        onConfirm={handleConfirmDeactivate}
      />
    </div>
  );
}
