"use client";

import Link from "next/link";
import {
  ShieldCheck,
  ChevronRight,
  Lock,
  Eye,
  Database,
  FileText,
  Mail,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { usePublicPage } from "@/hooks/use-cms";

export default function PrivacyNoticePage() {
  const { data: cmsPage, isLoading } = usePublicPage("privacy-policy");

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
            Privacy Notice
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
                <span>DATA PROTECTION &amp; PRIVACY</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Privacy Notice
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                This Privacy Notice explains how NeuroCommerce AI collects, uses, protects, and manages personal and account data when you browse our platform, create an account, purchase products, or interact with our services.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                <span className="font-semibold text-slate-900">Effective Date:</span>
                <span>August 2026</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                <span>Version 1.0 (Active)</span>
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
                Document Outline
              </h2>
              <nav aria-label="Table of Contents" className="space-y-1.5 text-xs font-medium">
                <a
                  href="#information-we-collect"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  1. Information We Collect
                </a>
                <a
                  href="#how-we-use-information"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  2. How We Use Information
                </a>
                <a
                  href="#information-sharing"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  3. Information Sharing &amp; Disclosure
                </a>
                <a
                  href="#data-security-retention"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  4. Data Security &amp; Storage
                </a>
                <a
                  href="#your-rights"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  5. Your Privacy Rights
                </a>
                <a
                  href="#contact-us"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  6. Contact Information
                </a>
              </nav>
            </div>
          </aside>

          {/* Core Content Body */}
          <article className="lg:col-span-8 space-y-6">
            {/* Section 1 */}
            <section
              id="information-we-collect"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <Database className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  1. Information We Collect
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We collect information directly from you when you interact with our platform, register an account, or submit purchase orders:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-1 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Account Credentials:</strong> Full name, email address, password hash, and optional profile contact details provided during registration.
                </li>
                <li>
                  <strong className="text-slate-900">Order &amp; Billing Data:</strong> Shipping destination addresses, billing contact information, payment status, and itemized purchase history.
                </li>
                <li>
                  <strong className="text-slate-900">Customer Support Communications:</strong> Inquiries, feedback, and customer service records submitted via platform forms.
                </li>
                <li>
                  <strong className="text-slate-900">Technical Session Data:</strong> IP address, browser type, device information, and session timestamps used for account security and platform operations.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section
              id="how-we-use-information"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <FileText className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  2. How We Use Information
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We use the information collected exclusively for legitimate platform operations and fulfillment purposes:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-1 leading-relaxed">
                <li>Processing, fulfilling, and dispatching hardware orders and generating accurate invoices.</li>
                <li>Managing user accounts, authenticating access tokens, and maintaining customer address books.</li>
                <li>Transmitting transactional notifications, shipping milestone updates, and password reset requests.</li>
                <li>Detecting, preventing, and mitigating unauthorized account access, fraudulent transactions, or platform abuse.</li>
                <li>Complying with applicable legal, accounting, and tax record-keeping requirements.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section
              id="information-sharing"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <Eye className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  3. Information Sharing &amp; Disclosure
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                NeuroCommerce AI does not sell, rent, or trade your personal information. Information is shared strictly under the following circumstances:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-1 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Service Providers &amp; Carriers:</strong> Third-party logistics carriers and payment gateways receive only the minimum information required to fulfill shipments and authorize transactions.
                </li>
                <li>
                  <strong className="text-slate-900">Legal Compliance:</strong> When required by lawful process, subpoena, or governmental inquiry to protect the rights, property, or safety of the platform and its users.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section
              id="data-security-retention"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <Lock className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  4. Data Security &amp; Storage
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We implement technical and organizational controls to safeguard customer data against unauthorized access, loss, or alteration:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-1 leading-relaxed">
                <li>Encrypted transport protocols (HTTPS/TLS) across all client interfaces and API communications.</li>
                <li>Stateless token authentication with automated session expiration safeguards.</li>
                <li>Strict Role-Based Access Control (RBAC) restricting data access to authorized administrative roles.</li>
                <li>Password hashing using strong one-way cryptographic algorithms (Bcrypt).</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section
              id="your-rights"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  5. Your Privacy Rights
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You possess rights regarding the personal information held within your NeuroCommerce account:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-1 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Access &amp; Rectification:</strong> You can view and update your profile information, saved addresses, and preferences directly via the Customer Portal.
                </li>
                <li>
                  <strong className="text-slate-900">Account Closure:</strong> You may request account deactivation or closure by contacting our administration team.
                </li>
                <li>
                  <strong className="text-slate-900">Communication Preferences:</strong> You can manage notification settings via the Customer Notification Center.
                </li>
              </ul>
            </section>

            {/* Section 6 */}
            <section
              id="contact-us"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  6. Contact Information
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                If you have questions or inquiries regarding this Privacy Notice or the management of your personal data, please contact our support team:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">NeuroCommerce AI Support</p>
                <p>Email: <a href="mailto:privacy@neurocommerce.ai" className="text-blue-600 hover:underline">privacy@neurocommerce.ai</a></p>
                <p>Platform Support: <Link href="/account" className="text-blue-600 hover:underline">Customer Portal</Link></p>
              </div>
            </section>
          </article>
        </div>
      </Container>
    </div>
  );
}
