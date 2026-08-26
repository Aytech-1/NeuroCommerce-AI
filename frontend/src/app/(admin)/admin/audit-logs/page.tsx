"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Eye,
  Search,
  User,
  Globe,
  Calendar,
  RefreshCw,
  ChevronRight,
  Filter,
  AlertCircle,
  FileCode,
  Shield,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { useAuditLogs } from "@/hooks/use-audit";

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [event, setEvent] = useState("");
  const [auditableType, setAuditableType] = useState("");

  const { data, isLoading, isError, refetch } = useAuditLogs({
    page,
    per_page: 20,
    event: event || undefined,
    auditable_type: auditableType.trim() || undefined,
  });

  const getEventBadge = (evt: string) => {
    switch (evt.toLowerCase()) {
      case "created":
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
            {evt}
          </span>
        );
      case "updated":
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
            {evt}
          </span>
        );
      case "deleted":
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono">
            {evt}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
            {evt}
          </span>
        );
    }
  };

  const totalEvents = data?.meta?.total ?? data?.data?.length ?? 0;
  const currentCount = data?.data?.length ?? 0;
  const distinctModels = data?.data
    ? Array.from(new Set(data.data.map((l) => l.auditable_type.split("\\").pop()))).length
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
            Audit Logs
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              SECURITY &amp; COMPLIANCE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Security &amp; Regulatory Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Immutable administrative ledger tracking state mutations, actor identities, IP origins, and compliance changes.
            </p>
          </div>

          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="h-10 px-4 gap-2 text-xs font-bold shadow-2xs"
          >
            <RefreshCw className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>Refresh Logs</span>
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
              Total Audited Events
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalEvents} Events
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Mutations
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {currentCount} In View
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Target Models
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {distinctModels} Entities
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Security Posture
            </span>
            <span className="text-xs font-extrabold text-emerald-700 mt-2 block">
              Immutable Ledger
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
              placeholder="Filter by Model Type (e.g. Order, User, Product)..."
              prefixIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              value={auditableType}
              onChange={(e) => {
                setAuditableType(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
              <Filter className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Event:</span>
            </div>

            <select
              value={event}
              onChange={(e) => {
                setEvent(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Mutation Events</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
            </select>

            {(event || auditableType) && (
              <button
                type="button"
                onClick={() => {
                  setEvent("");
                  setAuditableType("");
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
      {/* 4. AUDIT LOG TABLE                                                      */}
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
          <h3 className="text-base font-extrabold text-slate-900">Failed to load audit logs</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to communicate with the security and compliance ledger.
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
                <TableHead className="text-xs font-extrabold text-slate-700 py-3.5">Event</TableHead>
                <TableHead className="text-xs font-extrabold text-slate-700 py-3.5">Target Entity</TableHead>
                <TableHead className="text-xs font-extrabold text-slate-700 py-3.5">Actor</TableHead>
                <TableHead className="text-xs font-extrabold text-slate-700 py-3.5">Origin IP</TableHead>
                <TableHead className="text-xs font-extrabold text-slate-700 py-3.5">Timestamp</TableHead>
                <TableHead className="text-right text-xs font-extrabold text-slate-700 py-3.5">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell>{getEventBadge(log.event)}</TableCell>
                  <TableCell>
                    <div className="text-xs font-extrabold text-slate-900">
                      {log.auditable_type.split("\\").pop()}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 block truncate">
                      ID: {log.auditable_id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-extrabold text-slate-900">
                      {log.user ? log.user.name : "System / Automated"}
                    </div>
                    {log.user?.email && (
                      <span className="text-[10px] text-slate-400 block truncate">{log.user.email}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 font-semibold">
                    {log.ip_address || "127.0.0.1"}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 font-medium">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/audit-logs/${log.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Inspect Diff</span>
                      </Button>
                    </Link>
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
          icon={ShieldAlert}
          title="No Audit Records Found"
          description="System mutation events will be appended to this immutable ledger automatically."
        />
      )}
    </div>
  );
}
