"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { SalesChartPoint } from "@/services/dashboard-service";
import { TrendingUp, BarChart2, AlertCircle } from "lucide-react";

interface SalesRevenueChartProps {
  data?: SalesChartPoint[];
  isLoading: boolean;
  isError: boolean;
  periodLabel: string;
}

export function SalesRevenueChart({
  data = [],
  isLoading,
  isError,
  periodLabel,
}: SalesRevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <div className="h-56 flex items-end gap-2 pt-8">
          {[35, 60, 45, 80, 55, 95, 70, 65, 85, 90, 75, 100].map((h, i) => (
            <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (isError || data.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs text-center space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
          <BarChart2 className="h-6 w-6" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900">
            {isError ? "Failed to load sales chart" : "No sales data available"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isError
              ? "Unable to connect to backend analytics telemetry."
              : `No completed commercial orders recorded for ${periodLabel}.`}
          </p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100);
  const totalPeriodRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalPeriodOrders = data.reduce((sum, d) => sum + d.orders, 0);

  // SVG Chart Geometry
  const width = 600;
  const height = 200;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = height - padding - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Sales &amp; Revenue Curve
            </h2>
            <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {periodLabel} — Total: {formatCurrency(totalPeriodRevenue)} across {totalPeriodOrders} orders
          </p>
        </div>

        <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 self-start sm:self-auto">
          Live Telemetry
        </span>
      </div>

      {/* SVG Visualization */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 overflow-visible"
          preserveAspectRatio="none"
          aria-label="Sales and Revenue Graph"
        >
          <defs>
            <linearGradient id="salesRevenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - padding - ratio * chartHeight;
            return (
              <line
                key={ratio}
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Gradient Fill Area */}
          <path d={areaD} fill="url(#salesRevenueGrad)" />

          {/* Primary Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 6 : 3}
              className="fill-blue-600 stroke-white stroke-2 transition-all cursor-pointer"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Interactive Hover Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute pointer-events-none rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs z-20 transform -translate-x-1/2 -translate-y-14 space-y-0.5"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100}%`,
            }}
          >
            <div className="font-bold text-slate-500 text-[11px]">
              {points[hoveredIndex].data.date}
            </div>
            <div className="text-blue-600 font-extrabold text-xs">
              {formatCurrency(points[hoveredIndex].data.revenue)}
            </div>
            <div className="text-slate-400 text-[10px]">
              {points[hoveredIndex].data.orders} order(s)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
