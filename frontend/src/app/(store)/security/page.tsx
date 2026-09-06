"use client";

import Link from "next/link";
import {
  ShieldCheck,
  ChevronRight,
  Lock,
  KeyRound,
  FileCheck2,
  Server,
  Activity,
  UserCheck,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/ui/container";

export default function SecurityPolicyPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8 sm:py-12">
      <Container className="space-y-8">
        {/* ======================================================================= */}
        {/* 1. BREADCRUMB NAVIGATION                                                */}
        {/* ======================================================================= */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500"
        >
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span aria-current="page" className="text-slate-900 font-bold">
            Security Policy
          </span>
        </nav>

        {/* ======================================================================= */}
        {/* 2. EXECUTIVE HERO HEADER                                                */}
        {/* ======================================================================= */}
        <section className="relative overflow-hidden rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-10 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>PLATFORM SECURITY ARCHITECTURE</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Security Policy
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                NeuroCommerce AI is engineered with defense-in-depth security principles. This document outlines the technical safeguards, access control models, session policies, and architectural standards implemented across our platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                <span className="font-semibold text-slate-900">Document Status:</span>
                <span>Active</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                <span>Verified Architecture</span>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 3. MAIN CONTENT GRID (2 COLUMNS: TABLE OF CONTENTS + SECTIONS)          */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sticky Table of Contents (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Security Framework
              </h2>
              <nav aria-label="Table of Contents" className="space-y-1.5 text-xs font-medium">
                <a
                  href="#authentication-sessions"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  1. Authentication &amp; Sessions
                </a>
                <a
                  href="#rbac"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  2. Role-Based Access Control
                </a>
                <a
                  href="#api-integrity"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  3. API Integrity &amp; Validation
                </a>
                <a
                  href="#audit-logging"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  4. Audit Trails &amp; Logging
                </a>
                <a
                  href="#transport-security"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  5. Encryption in Transit
                </a>
                <a
                  href="#rate-limiting"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  6. Rate Limiting &amp; Abuse Prevention
                </a>
                <a
                  href="#reporting"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  7. Responsible Disclosure
                </a>
              </nav>
            </div>
          </aside>

          {/* Core Content Body */}
          <article className="lg:col-span-8 space-y-6">
            {/* Section 1 */}
            <section
              id="authentication-sessions"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <KeyRound className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  1. Authenticated Access &amp; Session Management
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The platform utilizes a modern token-based authentication architecture powered by Laravel Sanctum:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-1 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Bearer Token Transport:</strong> Requests to protected endpoints carry bearer tokens validated against active sessions on the API gateway.
                </li>
                <li>
                  <strong className="text-slate-900">Automatic Session Expiration Interception:</strong> HTTP 401 Unauthorized responses trigger an inline session expiration dialog, preserving client state while requesting re-authentication.
                </li>
                <li>
                  <strong className="text-slate-900">Password Hashing:</strong> User credentials are encrypted at rest using Bcrypt with a high work factor, ensuring plain-text passwords are never stored.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section
              id="rbac"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <UserCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  2. Role-Based Access Control (RBAC)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Permissions across the application are enforced strictly according to the principle of least privilege:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-1 leading-relaxed">
                <li>Five distinct authorization tiers: <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">super-admin</code>, <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">admin</code>, <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">manager</code>, <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">support</code>, and <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">customer</code>.</li>
                <li>Protected frontend routes and administrative panels are gated through semantic permission guards.</li>
                <li>All administrative API endpoints verify user roles and permissions on the server before dispatching actions.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section
              id="api-integrity"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <FileCheck2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  3. API Integrity &amp; Data Validation
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Data entering the system is subjected to multi-stage structural validation:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-1 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Server-Side Validation:</strong> Dedicated Laravel FormRequest validators inspect and sanitize all input payloads prior to controller execution.
                </li>
                <li>
                  <strong className="text-slate-900">Client-Side Schema Enforcement:</strong> Forms use React Hook Form and Zod schemas to ensure type-safe submissions and prevent malformed data.
                </li>
                <li>
                  <strong className="text-slate-900">Force JSON Middleware:</strong> API middleware enforces strict JSON request handling and prevents unintended content-type coercion.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section
              id="audit-logging"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <Activity className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  4. Immutable Audit Trails &amp; Logging
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                System operations and sensitive state transitions generate tamper-evident audit records:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-1 leading-relaxed">
                <li>Administrative mutations (creation, updates, status changes, and deletions) are recorded in the audit log.</li>
                <li>Audit records capture timestamp, authenticated actor ID, origin IP address, and before/after property diffs.</li>
                <li>Audited events are viewable exclusively by authorized administrators via the Audit Activity workspace.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section
              id="transport-security"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <Server className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  5. Encryption in Transit
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                All production traffic between clients, CDNs, and the application backend is encrypted in transit using HTTPS and modern TLS protocols. Insecure HTTP connections are automatically redirected to encrypted endpoints.
              </p>
            </section>

            {/* Section 6 */}
            <section
              id="rate-limiting"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <Lock className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  6. Rate Limiting &amp; Abuse Prevention
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Public and sensitive endpoints (such as authentication, password resets, and search) utilize Redis-backed rate limiters to mitigate brute-force attempts, credential stuffing, and automated denial-of-service traffic.
              </p>
            </section>

            {/* Section 7 */}
            <section
              id="reporting"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  7. Responsible Disclosure
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We welcome responsible security reports from researchers and users. If you discover a potential vulnerability or security concern, please contact our security team directly:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">NeuroCommerce AI Security Contact</p>
                <p>Email: <a href="mailto:security@neurocommerce.ai" className="text-blue-600 hover:underline">security@neurocommerce.ai</a></p>
              </div>
            </section>
          </article>
        </div>
      </Container>
    </div>
  );
}
