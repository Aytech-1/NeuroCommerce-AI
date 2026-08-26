"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Globe,
  Calendar,
  FileText,
  ChevronRight,
  Shield,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useAuditLog } from "@/hooks/use-audit";

export default function AuditLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: log, isLoading, isError } = useAuditLog(id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-28 rounded-[20px]" />
          <Skeleton className="h-28 rounded-[20px]" />
          <Skeleton className="h-28 rounded-[20px]" />
        </div>
        <Skeleton className="h-80 rounded-[20px]" />
      </div>
    );
  }

  if (isError || !log) {
    return (
      <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-rose-200 shadow-2xs text-center space-y-3 max-w-2xl mx-auto my-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
          <ShieldCheck className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-base font-extrabold text-slate-900">Audit Record Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The requested audit entry does not exist or has expired.
        </p>
        <Link href="/admin/audit-logs">
          <Button variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Back to Audit Trail
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate Diff keys
  const oldVals = log.old_values || {};
  const newVals = log.new_values || {};
  const allKeys = Array.from(new Set([...Object.keys(oldVals), ...Object.keys(newVals)]));

  const maskIfSensitive = (key: string, val: unknown) => {
    const sensitive = ["password", "secret", "token", "api_key", "cvv", "credit_card"];
    if (sensitive.some((s) => key.toLowerCase().includes(s))) {
      return "••••••••••••••••";
    }
    if (val === null || val === undefined) return <span className="text-slate-400 italic">null</span>;
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const modelName = log.auditable_type.split("\\").pop();

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
          <Link href="/admin/audit-logs" className="hover:text-blue-600 transition-colors">
            Audit Logs
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Entry Inspection
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              AUDIT RECORD INSPECTION
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Audit Entry: {log.event.toUpperCase()} on {modelName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Audit Log ID: <span className="font-mono text-slate-700 font-semibold">{log.id}</span> • Recorded at {formatDate(log.created_at)}
            </p>
          </div>

          <Link href="/admin/audit-logs">
            <Button variant="outline" size="sm" className="h-10 px-4 gap-2 text-xs font-bold shadow-2xs">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Audit Trail</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. ACTOR & CONTEXT OVERVIEW CARDS                                       */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <User className="h-4 w-4" aria-hidden="true" />
            <span>Actor Identity</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">
            {log.user ? log.user.name : "System Daemon / CLI"}
          </p>
          {log.user?.email && <p className="text-xs text-slate-500">{log.user.email}</p>}
        </div>

        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span>Origin Network</span>
          </div>
          <p className="text-sm font-extrabold font-mono text-slate-900">
            {log.ip_address || "127.0.0.1"}
          </p>
          {log.user_agent && (
            <p className="text-[10px] text-slate-400 truncate" title={log.user_agent}>
              {log.user_agent}
            </p>
          )}
        </div>

        <div className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <FileText className="h-4 w-4" aria-hidden="true" />
            <span>Target Resource</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">
            {modelName}
          </p>
          <p className="text-[10px] font-mono text-slate-400 truncate">ID: {log.auditable_id}</p>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 3. ATTRIBUTE MUTATION DIFF TABLE                                        */}
      {/* ======================================================================= */}
      <div className="rounded-[20px] bg-white border border-slate-200/90 shadow-2xs overflow-hidden space-y-0">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <h2 className="text-base font-extrabold text-slate-900">Attribute State Diff</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comparison of state before and after the mutation was committed.
          </p>
        </div>

        <div>
          {allKeys.length > 0 ? (
            <Table>
              <TableHeader className="bg-slate-50/75 border-b border-slate-200/80">
                <TableRow>
                  <TableHead className="w-1/4 text-xs font-extrabold text-slate-700 py-3.5">Field</TableHead>
                  <TableHead className="w-3/8 text-xs font-extrabold text-slate-700 py-3.5">Previous Value (Before)</TableHead>
                  <TableHead className="w-3/8 text-xs font-extrabold text-slate-700 py-3.5">New Value (After)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allKeys.map((key) => {
                  const before = oldVals[key];
                  const after = newVals[key];
                  const isChanged = before !== after;

                  return (
                    <TableRow
                      key={key}
                      className={isChanged ? "bg-amber-50/30 hover:bg-amber-50/60" : "hover:bg-slate-50/80"}
                    >
                      <TableCell className="font-mono text-xs font-extrabold text-slate-900">
                        {key}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-rose-700 font-semibold break-all">
                        {maskIfSensitive(key, before)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-emerald-700 font-semibold break-all">
                        {maskIfSensitive(key, after)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 font-medium">
              No attribute mutations recorded for this event.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
