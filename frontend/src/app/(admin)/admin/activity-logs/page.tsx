"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  RefreshCw,
  ChevronRight,
  User,
  Globe,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Shield,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { useActivityLogs } from "@/hooks/use-audit";

export default function AdminActivityLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useActivityLogs({
    page,
    per_page: 20,
  });

  const totalActivities = data?.meta?.total ?? data?.data?.length ?? 0;
  const currentCount = data?.data?.length ?? 0;
  const distinctUsers = data?.data
    ? Array.from(new Set(data.data.map((item) => (item.user ? item.user.name : "Automated System")))).length
    : 0;

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
            Activity Logs
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              OPERATIONS ACTIVITY
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Activity Logs &amp; Operational Events
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              High-level operational timeline recording staff logins, role updates, inventory modifications, and system events.
            </p>
          </div>

          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="h-10 px-4 gap-2 text-xs font-bold shadow-2xs"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. KPI SUMMARY ROW                                                      */}
      {/* ======================================================================= */}
      {data?.data && data.data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Activities
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalActivities} Activities
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Recent Actions
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {currentCount} In View
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Operators Tracked
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {distinctUsers} Actors
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Audit Level
            </span>
            <span className="text-xs font-extrabold text-emerald-700 mt-2 block">
              Operational Feed
            </span>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. ACTIVITY LOG TABLE                                                   */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-rose-200 shadow-2xs text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Failed to load activity logs</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to retrieve operational activity records.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Retry Loading
          </Button>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="rounded-[20px] bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/75 border-b border-slate-200/80">
              <TableRow>
                <TableHead className="text-xs font-extrabold text-slate-700 py-3.5">Action</TableHead>
                <TableHead className="text-xs font-extrabold text-slate-700 py-3.5">Description</TableHead>
                <TableHead className="text-xs font-extrabold text-slate-700 py-3.5">Staff Member</TableHead>
                <TableHead className="text-xs font-extrabold text-slate-700 py-3.5">IP Origin</TableHead>
                <TableHead className="text-right text-xs font-extrabold text-slate-700 py-3.5">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell>
                    <span className="inline-flex items-center text-[10px] font-extrabold font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-medium">
                    {item.description}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-extrabold text-slate-900">
                      {item.user ? item.user.name : "Automated System"}
                    </div>
                    {item.user?.email && (
                      <span className="text-[10px] text-slate-400 block truncate">{item.user.email}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 font-semibold">
                    {item.ip_address || "127.0.0.1"}
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-500 font-medium">
                    {formatDate(item.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data.meta && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Page {data.meta.current_page} of {data.meta.last_page || 1}
              </span>
              <Pagination
                currentPage={data.meta.current_page}
                totalPages={data.meta.last_page || Math.ceil(data.meta.total / (data.meta.per_page || 20))}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Activity}
          title="No Activity Logs Found"
          description="Administrative and staff actions will appear here in chronological order."
        />
      )}
    </div>
  );
}
