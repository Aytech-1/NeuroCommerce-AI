"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flag,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  RefreshCw,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
  Copy,
  CheckCheck,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Can } from "@/components/ui/can";
import { useFeatureFlags, useToggleFeatureFlag } from "@/hooks/use-feature-flags";
import { toast } from "sonner";

export default function AdminFeatureFlagsPage() {
  const { data: flags, isLoading, isError, refetch } = useFeatureFlags();
  const toggleMutation = useToggleFeatureFlag();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleToggle = async (name: string, currentEnabled: boolean) => {
    try {
      await toggleMutation.mutateAsync({
        name,
        isEnabled: !currentEnabled,
      });
      toast.success(`Feature flag "${name}" ${!currentEnabled ? "enabled" : "disabled"}.`);
    } catch {
      toast.error("Failed to toggle feature flag.");
    }
  };

  const handleRolloutChange = async (name: string, rollout: number) => {
    try {
      await toggleMutation.mutateAsync({
        name,
        rollout,
      });
      toast.success(`Rollout for "${name}" updated to ${rollout}%.`);
    } catch {
      toast.error("Failed to update rollout percentage.");
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("Flag key copied to clipboard.");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const totalFlags = flags?.length ?? 0;
  const activeCount = flags?.filter((f) => f.is_enabled).length ?? 0;
  const disabledCount = flags?.filter((f) => !f.is_enabled).length ?? 0;

  const filteredFlags = flags?.filter((flag) => {
    const matchesSearch =
      !search ||
      flag.name.toLowerCase().includes(search.toLowerCase()) ||
      (flag.description && flag.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && flag.is_enabled) ||
      (statusFilter === "disabled" && !flag.is_enabled);

    return matchesSearch && matchesStatus;
  });

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
            Feature Flags
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              FEATURE GOVERNANCE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Feature Flags &amp; Canary Rollout
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Control the availability of platform capabilities using the existing feature configuration.
            </p>
          </div>

          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="h-10 px-4 gap-2 text-xs font-bold shadow-2xs"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>Refresh Flags</span>
          </Button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. KPI SUMMARY ROW                                                      */}
      {/* ======================================================================= */}
      {flags && flags.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Flags
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalFlags} Toggles
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Flags
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {activeCount} Active
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Disabled Flags
            </span>
            <span className="text-xl font-extrabold text-slate-600 mt-1 block">
              {disabledCount} Disabled
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Targeting Engine
            </span>
            <span className="text-xs font-extrabold text-emerald-700 mt-2 block">
              Canary Synchronized
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
              placeholder="Search feature flags by name or key..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Flags</option>
              <option value="active">Active Flags</option>
              <option value="disabled">Disabled Flags</option>
            </select>

            {(search || statusFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
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
      {/* 4. FEATURE FLAGS CARDS                                                  */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 rounded-[20px]" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-rose-200 shadow-2xs text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Failed to load feature flags</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to retrieve the current feature configuration.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Retry Loading
          </Button>
        </div>
      ) : filteredFlags && filteredFlags.length > 0 ? (
        <div className="space-y-4">
          {filteredFlags.map((flag) => (
            <div
              key={flag.name}
              className="p-5 sm:p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 font-mono text-xs font-bold text-slate-900">
                      <span>{flag.name}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(flag.name)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        aria-label={`Copy key ${flag.name}`}
                      >
                        {copiedKey === flag.name ? (
                          <CheckCheck className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>

                    {flag.is_enabled ? (
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

                  {flag.description && (
                    <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                      {flag.description}
                    </p>
                  )}
                </div>

                <Can permission="config.update">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={flag.is_enabled}
                        onChange={() => handleToggle(flag.name, flag.is_enabled)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </Can>
              </div>

              {/* Canary Percentage Slider */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 font-semibold">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                  <span>Canary Rollout:</span>
                  <span className="font-extrabold text-slate-900 font-mono text-sm">
                    {flag.rollout_percentage}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={flag.rollout_percentage}
                    onChange={(e) =>
                      handleRolloutChange(flag.name, parseInt(e.target.value, 10) || 0)
                    }
                    className="w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Flag}
          title="No Feature Flags Defined"
          description="Feature toggles declared in configuration will appear here."
        />
      )}
    </div>
  );
}
