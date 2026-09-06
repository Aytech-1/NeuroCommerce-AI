"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Server,
  Database,
  ChevronRight,
  ExternalLink,
  Clock,
  Radio,
  HardDrive,
  Sparkles,
  Zap,
  Sliders,
  FileText,
  CreditCard,
  Truck,
  Flag,
  Layers,
} from "lucide-react";
import {
  useAdminSystemHealth,
  useSystemHealth,
  useSystemVersion,
  HEALTH_QUERY_KEYS,
} from "@/hooks/use-health";
import { useActivityLogs } from "@/hooks/use-audit";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminSystemHealthPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Authoritative admin detailed diagnostic query
  const adminHealthQuery = useAdminSystemHealth?.();
  const adminHealth = adminHealthQuery?.data;
  const isAdminHealthLoading = adminHealthQuery?.isLoading;
  const isAdminHealthError = adminHealthQuery?.isError;
  const refetchAdminHealth = adminHealthQuery?.refetch;
  const adminHealthUpdatedAt = adminHealthQuery?.dataUpdatedAt;

  // Fallback public telemetry hooks if admin payload is pending
  const publicHealthQuery = useSystemHealth?.();
  const publicHealth = publicHealthQuery?.data;
  const publicVersionQuery = useSystemVersion?.();
  const publicVersion = publicVersionQuery?.data;

  const activityQuery = useActivityLogs({ per_page: 5 });
  const activityLogsData = activityQuery?.data;
  const isActivityLoading = activityQuery?.isLoading;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.adminHealth }),
        queryClient.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.health }),
        queryClient.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.version }),
        queryClient.invalidateQueries({ queryKey: ["admin", "activity-logs"] }),
      ]);
      toast.success("System operational diagnostics refreshed.");
    } catch {
      toast.error("Failed to refresh system status.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const isHealthy = adminHealth
    ? adminHealth.status === "healthy"
    : publicHealth?.status === "healthy";
  const isDegraded = adminHealth?.status === "degraded";
  const isUnhealthy = adminHealth
    ? adminHealth.status === "unhealthy"
    : publicHealth?.status === "unhealthy";

  const isOverallLoading = isAdminHealthLoading ?? publicHealthQuery?.isLoading;
  const isOverallError = isAdminHealthError ?? publicHealthQuery?.isError;

  const recentActivities = activityLogsData?.data || [];
  const warnings = adminHealth?.security_warnings || [];

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
            System Health
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              SYSTEM OPERATIONS
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              System Health
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Monitor the operational state of the NeuroCommerce platform, service availability, application health, and authoritative diagnostic telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/activity-logs"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>View Activity</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            </Link>

            <Button
              type="button"
              variant="primary"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              className="h-10 px-4 gap-2 text-xs font-bold shadow-xs bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              <span>Refresh Status</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. ERROR STATE                                                          */}
      {/* ======================================================================= */}
      {isOverallError ? (
        <div className="p-8 text-center rounded-[20px] bg-white border border-rose-200 shadow-2xs space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900">Unable to retrieve system health</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn't retrieve the latest operational status from the platform health endpoints. Please check network connectivity and retry.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              if (refetchAdminHealth) refetchAdminHealth();
              if (publicHealthQuery?.refetch) publicHealthQuery.refetch();
            }}
            className="h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700"
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* ======================================================================= */}
          {/* 3. SYSTEM STATUS HERO                                                   */}
          {/* ======================================================================= */}
          {isOverallLoading ? (
            <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
          ) : (
            <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isHealthy
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : isDegraded
                      ? "bg-amber-50 text-amber-600 border border-amber-200"
                      : "bg-rose-50 text-rose-600 border border-rose-200"
                  }`}
                >
                  {isHealthy ? (
                    <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                  ) : isDegraded ? (
                    <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-6 w-6" aria-hidden="true" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {isHealthy
                        ? "System Operational"
                        : isDegraded
                        ? "Degraded Performance Detected"
                        : "Service Disruption Detected"}
                    </h2>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        isHealthy
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isDegraded
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isHealthy ? "Healthy" : isDegraded ? "Degraded" : "Attention Required"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xl">
                    {isHealthy
                      ? "All core platform API micro-services, background pipelines, and security boundaries are responding normally."
                      : isDegraded
                      ? "Some services are operating with elevated latency or configuration warnings. Core functions remain accessible."
                      : "Critical infrastructure services are currently experiencing connection disruptions."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-xs text-slate-500 shrink-0">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Telemetry Last Checked
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>
                      {adminHealth?.checked_at
                        ? new Date(adminHealth.checked_at).toLocaleTimeString()
                        : adminHealthUpdatedAt
                        ? new Date(adminHealthUpdatedAt).toLocaleTimeString()
                        : "Just now"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* 4. EXECUTIVE HEALTH SUMMARY KPI ROW                                     */}
          {/* ======================================================================= */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Platform Posture
              </span>
              <span
                className={`text-lg sm:text-xl font-extrabold mt-1 block ${
                  isHealthy ? "text-emerald-700" : isDegraded ? "text-amber-700" : "text-rose-700"
                }`}
              >
                {isHealthy ? "Operational" : isDegraded ? "Degraded" : "Unhealthy"}
              </span>
            </div>

            <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                API Version
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block font-mono">
                v{adminHealth?.application?.version || publicHealth?.version || publicVersion?.version || "1.0.0"}
              </span>
            </div>

            <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Framework Runtime
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-blue-600 mt-1 block">
                Laravel {adminHealth?.application?.laravel_version ? adminHealth.application.laravel_version.split(".")[0] : publicVersion?.laravel ? publicVersion.laravel.split(".")[0] : "11"}
              </span>
            </div>

            <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                PHP Engine
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block font-mono">
                PHP {adminHealth?.application?.php_version ? adminHealth.application.php_version.split(".").slice(0, 2).join(".") : publicVersion?.php ? publicVersion.php.split(".").slice(0, 2).join(".") : "8.4"}
              </span>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* 5. SECURITY & CONFIGURATION WARNINGS PANEL (IF ANY)                     */}
          {/* ======================================================================= */}
          {warnings.length > 0 && (
            <div className="p-5 rounded-[20px] bg-amber-50 border border-amber-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <h3 className="text-xs sm:text-sm font-extrabold text-amber-900">
                  Configuration &amp; Security Advisories ({warnings.length})
                </h3>
              </div>
              <div className="space-y-2">
                {warnings.map((warn, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5"
                  >
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                        warn.severity === "critical"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {warn.severity}
                    </span>
                    <span className="leading-relaxed font-medium">{warn.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* 6. SERVICE HEALTH & OPERATIONAL SIGNALS (2-COLUMN)                      */}
          {/* ======================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Service Health Matrix */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-5 sm:p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Server className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      <span>Monitored Services</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Authoritative diagnostics for database persistence, fast cache, queues, and storage.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    6 Services
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {/* Service 1: API Gateway */}
                  <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                        <Radio className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 block truncate">
                          Application REST API Gateway
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          Laravel {adminHealth?.application?.laravel_version || publicVersion?.laravel || "11"} • PHP {adminHealth?.application?.php_version || publicVersion?.php || "8.4"}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span>Operational</span>
                    </span>
                  </div>

                  {/* Service 2: Database Connectivity */}
                  <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 shrink-0">
                        <Database className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 block truncate">
                          Database Connectivity &amp; Persistence
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate font-mono">
                          {adminHealth?.database?.connection ? adminHealth.database.connection.toUpperCase() : "MySQL"} • {adminHealth?.database?.database_name || "neurocommerce_ai"} {adminHealth?.database?.response_time_ms ? `(${adminHealth.database.response_time_ms} ms)` : ""}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                        adminHealth?.database?.status === "healthy" || !adminHealth
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          adminHealth?.database?.status === "healthy" || !adminHealth
                            ? "bg-emerald-500"
                            : "bg-rose-500"
                        }`}
                        aria-hidden="true"
                      />
                      <span>{adminHealth?.database?.status === "healthy" || !adminHealth ? "Operational" : "Failed"}</span>
                    </span>
                  </div>

                  {/* Service 3: Cache & Fast Storage */}
                  <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                        <Zap className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 block truncate">
                          Cache Subsystem &amp; Session Store
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate font-mono">
                          Cache Driver: {adminHealth?.cache?.driver || "file"} {adminHealth?.cache?.response_time_ms ? `(${adminHealth.cache.response_time_ms} ms)` : ""}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                        adminHealth?.cache?.status === "healthy" || !adminHealth
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          adminHealth?.cache?.status === "healthy" || !adminHealth
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                        aria-hidden="true"
                      />
                      <span>{adminHealth?.cache?.status === "healthy" || !adminHealth ? "Operational" : "Degraded"}</span>
                    </span>
                  </div>

                  {/* Service 4: Queue Infrastructure */}
                  <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                        <Layers className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 block truncate">
                          Queue &amp; Background Pipeline
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          Queue Driver: {adminHealth?.queue?.driver || "sync"} • Workers: {adminHealth?.queue?.worker_status || "Managed Externally"}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden="true" />
                      <span>Configured</span>
                    </span>
                  </div>

                  {/* Service 5: Media & Storage */}
                  <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                        <HardDrive className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 block truncate">
                          Media &amp; Local Storage Disk
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          Disk: {adminHealth?.storage?.disk || "local"} • Writable: {adminHealth?.storage?.writable ? "Yes" : "ReadOnly"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                        adminHealth?.storage?.status === "healthy" || !adminHealth
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          adminHealth?.storage?.status === "healthy" || !adminHealth
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                        aria-hidden="true"
                      />
                      <span>{adminHealth?.storage?.status === "healthy" || !adminHealth ? "Operational" : "Degraded"}</span>
                    </span>
                  </div>

                  {/* Service 6: AI Intelligence Engine */}
                  <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shrink-0">
                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 block truncate">
                          AI Recommendation Intelligence Engine
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          Provider: {adminHealth?.external_services?.[0]?.provider || "Active"}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span>Operational</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Subsystem Navigation */}
              <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Administration Portals
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <Link
                    href="/admin/settings"
                    className="flex items-center gap-1.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Sliders className="h-3.5 w-3.5 text-blue-600" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    href="/admin/audit-logs"
                    className="flex items-center gap-1.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                    <span>Audit Logs</span>
                  </Link>
                  <Link
                    href="/admin/payments"
                    className="flex items-center gap-1.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <CreditCard className="h-3.5 w-3.5 text-purple-600" />
                    <span>Payments</span>
                  </Link>
                  <Link
                    href="/admin/shipping"
                    className="flex items-center gap-1.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Truck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Shipping</span>
                  </Link>
                  <Link
                    href="/admin/system/feature-flags"
                    className="flex items-center gap-1.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Flag className="h-3.5 w-3.5 text-rose-600" />
                    <span>Flags</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Recent Operational Signals */}
            <div className="space-y-6">
              <div className="p-5 sm:p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      <span>Recent Signals</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live audit and operational events.
                    </p>
                  </div>
                  <Link
                    href="/admin/activity-logs"
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    All →
                  </Link>
                </div>

                {isActivityLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                  </div>
                ) : recentActivities.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {recentActivities.map((act) => (
                      <div key={act.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono truncate max-w-[150px]">
                            {act.action}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatDate(act.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 line-clamp-2">
                          {act.description}
                        </p>
                        {act.user && (
                          <span className="text-[10px] text-slate-400 block truncate">
                            Actor: {act.user.name} ({act.user.email})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No recent operational activity recorded.
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
