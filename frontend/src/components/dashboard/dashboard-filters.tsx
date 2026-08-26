"use client";

import { Button } from "@/components/ui/button";
import { RotateCw, Calendar, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnalyticsPeriod = "daily" | "weekly" | "monthly";

interface DashboardFiltersProps {
  period: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function DashboardFilters({
  period,
  onPeriodChange,
  onRefresh,
  isRefreshing = false,
}: DashboardFiltersProps) {
  const periods: { id: AnalyticsPeriod; label: string }[] = [
    { id: "daily", label: "Last 30 Days" },
    { id: "weekly", label: "Last 12 Weeks" },
    { id: "monthly", label: "Last 12 Months" },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-1">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span>Timeframe:</span>
        </div>
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
          {periods.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPeriodChange(p.id)}
              className={cn(
                "px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all",
                period === p.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all shadow-2xs"
        >
          <RotateCw className={cn("h-3.5 w-3.5 text-blue-600", isRefreshing && "animate-spin")} aria-hidden="true" />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Telemetry"}</span>
        </button>
      </div>
    </div>
  );
}
