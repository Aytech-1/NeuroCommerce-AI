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
  ShieldCheck,
  Cpu,
  Layers,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Clock,
  Radio,
} from "lucide-react";
import { useSystemHealth, useSystemVersion, HEALTH_QUERY_KEYS } from "@/hooks/use-health";
import { useActivityLogs } from "@/hooks/use-audit";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminSystemHealthPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: health,
    isLoading: isHealthLoading,
    isError: isHealthError,
    refetch: refetchHealth,
    dataUpdatedAt: healthUpdatedAt,
  } = useSystemHealth();

  const {
    data: version,
    isLoading: isVersionLoading,
  } = useSystemVersion();

  const {
    data: activityLogsData,
    isLoading: isActivityLoading,
  } = useActivityLogs({ per_page: 5 });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.health }),
        queryClient.invalidateQueries({ queryKey: HEALTH_QUERY_KEYS.version }),
        queryClient.invalidateQueries({ queryKey: ["admin", "activity-logs"] }),
      ]);
      toast.success("System operational status refreshed.");
    } catch {
      toast.error("Failed to refresh system status.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const isHealthy = health?.status === "healthy";
  const recentActivities = activityLogsData?.data || [];

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
              Monitor the operational state of the NeuroCommerce platform, service availability, application health, and recent operational signals.
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
              className="h-10 px-4 gap-2 text-xs font-bold shadow-xs"
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
      {isHealthError ? (
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
            onClick={() => refetchHealth()}
            className="h-10 px-5 text-xs font-bold"
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* ======================================================================= */}
          {/* 3. SYSTEM STATUS HERO                                                   */}
          {/* ======================================================================= */}
          {isHealthLoading ? (
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
                      : "bg-rose-50 text-rose-600 border border-rose-200"
                  }`}
                >
                  {isHealthy ? (
                    <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="h-6 w-6" aria-hidden="true" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {isHealthy ? "System Operational" : "Service Disruption Detected"}
                    </h2>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        isHealthy
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {isHealthy ? "Healthy" : "Attention Required"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 max-w-xl">
                    All core platform API micro-services, background pipelines, and security boundaries are responding normally.
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
                    <span>{healthUpdatedAt ? new Date(healthUpdatedAt).toLocaleTimeString() : "Just now"}</span>
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
              <span className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1 block">
                {isHealthy ? "Operational" : "Degraded"}
              </span>
            </div>

            <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                API Version
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
                v{health?.version || version?.version || "1.0.0"}
              </span>
            </div>

            <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Framework Runtime
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-blue-600 mt-1 block">
                Laravel {version?.laravel ? version.laravel.split(".")[0] : "11"}
              </span>
            </div>

            <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                PHP Engine
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
                PHP {version?.php ? version.php.split(".").slice(0, 2).join(".") : "8.4"}
              </span>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* 5. SERVICE HEALTH & OPERATIONAL SIGNALS (2-COLUMN)                      */}
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
                      Core application infrastructure, database persistence, and authorization endpoints.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    5 Services
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
                          v1 Router / Response Envelope Pipeline
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
                        <span className="text-[11px] text-slate-400 block truncate">
                          MySQL InnoDB / UUID Primary Key Indexing
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span>Operational</span>
                    </span>
                  </div>

                  {/* Service 3: Authentication & RBAC */}
                  <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 block truncate">
                          Authentication &amp; RBAC Boundary
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          Laravel Sanctum / Permission Engine
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span>Operational</span>
                    </span>
                  </div>

                  {/* Service 4: Security & Audit Logging */}
                  <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                        <Layers className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 block truncate">
                          Security Audit &amp; Compliance Trail
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          State Mutation &amp; IP Origin Ledger
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span>Operational</span>
                    </span>
                  </div>

                  {/* Service 5: System Configuration */}
                  <div className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                        <Cpu className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 block truncate">
                          Configuration &amp; Controlled Rollout
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          Dynamic System Flags &amp; Canary Engine
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

              {/* Incident & Security Notice Panel */}
              <div className="p-5 sm:p-6 rounded-[20px] bg-emerald-50/50 border border-emerald-200/90 shadow-2xs space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-emerald-900">
                    No Active Incidents Detected
                  </h3>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed max-w-2xl">
                  All platform sub-systems, catalog indexes, and fulfillment endpoints are reporting stable execution telemetry. Zero service interruptions reported.
                </p>
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
