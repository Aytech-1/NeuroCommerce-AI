"use client";

import Link from "next/link";
import {
  FileText,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Scale,
  ShoppingBag,
  CreditCard,
  Truck,
  RotateCcw,
  ShieldAlert,
  Mail,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { usePublicPage } from "@/hooks/use-cms";

export default function TermsOfServicePage() {
  const { data: cmsPage, isLoading } = usePublicPage("terms-of-service");

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
            Terms of Service
          </span>
        </nav>

        {/* ======================================================================= */}
        {/* 2. EXECUTIVE HERO HEADER                                                */}
        {/* ======================================================================= */}
        <section className="relative overflow-hidden rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-10 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                <span>USER &amp; COMMERCE AGREEMENT</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Terms of Service
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                These Terms of Service govern your access to and use of the NeuroCommerce AI platform, including account registration, catalog browsing, order placement, and digital commerce transactions.
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
                  href="#agreement"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  1. Agreement to Terms
                </a>
                <a
                  href="#account-responsibilities"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  2. Account Responsibilities
                </a>
                <a
                  href="#product-orders-pricing"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  3. Product Orders &amp; Pricing
                </a>
                <a
                  href="#payment-billing"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  4. Payment &amp; Billing
                </a>
                <a
                  href="#shipping-delivery"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  5. Shipping &amp; Delivery
                </a>
                <a
                  href="#returns-refunds"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  6. Returns &amp; Refunds
                </a>
                <a
                  href="#intellectual-property"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  7. Intellectual Property
                </a>
                <a
                  href="#liability-disclaimer"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  8. Limitation of Liability
                </a>
                <a
                  href="#contact-terms"
                  className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                >
                  9. Contact &amp; Inquiries
                </a>
              </nav>
            </div>
          </aside>

          {/* Core Content Body */}
          <article className="lg:col-span-8 space-y-6">
            {/* Section 1 */}
            <section
              id="agreement"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <FileText className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  1. Agreement to Terms
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                By accessing or using the NeuroCommerce AI platform, creating a customer account, or completing an order, you agree to be bound by these Terms of Service and our Privacy Notice. If you do not agree with any part of these terms, you should discontinue use of the platform immediately.
              </p>
            </section>

            {/* Section 2 */}
            <section
              id="account-responsibilities"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  2. Account Responsibilities
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                When registering an account on NeuroCommerce AI, you agree to:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-1 leading-relaxed">
                <li>Provide accurate, current, and complete registration information.</li>
                <li>Maintain the confidentiality and security of your account credentials and passwords.</li>
                <li>Notify us promptly if you discover or suspect unauthorized access to your account.</li>
                <li>Accept responsibility for all activities that occur under your authenticated credentials.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section
              id="product-orders-pricing"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <ShoppingBag className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  3. Product Orders &amp; Pricing
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                All product listings, specifications, and prices displayed on NeuroCommerce AI are subject to verification:
              </p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 list-disc list-inside pl-1 leading-relaxed">
                <li>
                  <strong className="text-slate-900">Order Acceptance:</strong> Receipt of an electronic order confirmation does not signify our final acceptance of your order. We reserve the right to limit quantities or decline orders where inventory is unavailable or pricing discrepancies occur.
                </li>
                <li>
                  <strong className="text-slate-900">Pricing Accuracy:</strong> We strive to maintain accurate catalog pricing. If an error is identified, we will notify you and provide the option to reconfirm the order at the correct price or cancel it with a full refund.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section
              id="payment-billing"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <CreditCard className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  4. Payment &amp; Billing
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Payments must be submitted using authorized payment methods at checkout. You represent that you are authorized to use the chosen payment method. Orders will be processed upon successful authorization and settlement.
              </p>
            </section>

            {/* Section 5 */}
            <section
              id="shipping-delivery"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <Truck className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  5. Shipping &amp; Delivery
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Estimated shipping dates and delivery schedules are estimates based on warehouse processing and carrier operations. Risk of loss and title for items purchased pass to the customer upon delivery by the carrier to the destination address specified at checkout.
              </p>
            </section>

            {/* Section 6 */}
            <section
              id="returns-refunds"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <RotateCcw className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  6. Returns &amp; Refunds
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Orders may be eligible for return or refund in accordance with our return guidelines. If an order is canceled or returned, approved refunds will be credited back to the original payment method utilized during checkout.
              </p>
            </section>

            {/* Section 7 */}
            <section
              id="intellectual-property"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <Scale className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  7. Intellectual Property
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                All brand marks, logos, user interfaces, text, graphics, and software underlying NeuroCommerce AI are the intellectual property of NeuroCommerce or respective licensed brand partners. You may not copy, modify, distribute, or reverse-engineer platform assets without prior authorization.
              </p>
            </section>

            {/* Section 8 */}
            <section
              id="liability-disclaimer"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  8. Limitation of Liability
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To the maximum extent permitted by applicable law, NeuroCommerce AI and its affiliates shall not be liable for indirect, incidental, special, or consequential damages resulting from the use or inability to use the platform or purchased products.
              </p>
            </section>

            {/* Section 9 */}
            <section
              id="contact-terms"
              className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-4"
            >
              <div className="flex items-center gap-2.5 text-blue-600">
                <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  9. Contact &amp; Inquiries
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                For legal notices, contract inquiries, or clarification regarding these Terms of Service, please contact our team:
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">NeuroCommerce AI Legal Department</p>
                <p>Email: <a href="mailto:legal@neurocommerce.ai" className="text-blue-600 hover:underline">legal@neurocommerce.ai</a></p>
                <p>Platform Support: <Link href="/account" className="text-blue-600 hover:underline">Customer Portal</Link></p>
              </div>
            </section>
          </article>
        </div>
      </Container>
    </div>
  );
}
