"use client";

import Link from "next/link";
import { Headphones, ArrowRight, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";

export function ExpertCTA() {
  return (
    <section
      aria-labelledby="expert-guidance-heading"
      className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden"
    >
      <Container>
        {/* ======================================================================= */}
        {/* MAIN CTA CONTAINER (24px radius, #EFF6FF surface, #BFDBFE border)       */}
        {/* ======================================================================= */}
        <div className="relative overflow-hidden rounded-[24px] border border-blue-200/90 bg-gradient-to-br from-[#EFF6FF] via-[#F4F8FF] to-[#E0E7FF]/50 p-8 sm:p-12 lg:p-16 shadow-sm">
          {/* Subtle Decorative Ambient Glow and Neural Waveform Elements (aria-hidden) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />

            <svg
              className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full opacity-10 text-blue-600 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 400 400"
              aria-hidden="true"
            >
              <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="200" cy="200" r="40" stroke="currentColor" strokeWidth="2" />
              <path d="M40 200h320M200 40v320" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* =================================================================== */}
            {/* LEFT COLUMN: Expert Consultation (~58% width on desktop)            */}
            {/* =================================================================== */}
            <div className="lg:col-span-7">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 block">
                EXPERT GUIDANCE
              </span>

              <h2
                id="expert-guidance-heading"
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-4"
              >
                Not Sure Which Technology Is Right for You?
              </h2>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                Get personalized guidance from our team and discover the products and technology solutions
                that best fit your needs.
              </p>

              {/* Conversion Buttons: 44px+ height */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/products"
                  className="inline-flex h-12 sm:h-13 items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 text-sm sm:text-base font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-98"
                >
                  <Headphones className="h-4 w-4" aria-hidden="true" />
                  <span>Talk to an Expert</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  href="/products"
                  className="inline-flex h-12 sm:h-13 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 text-sm sm:text-base font-bold text-slate-800 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-98"
                >
                  <span>Explore Catalog</span>
                </Link>
              </div>

              {/* Assurance trust row */}
              <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-blue-200/60 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <span>Certified Specialists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <span>Personalized Recommendations</span>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* RIGHT COLUMN: Newsletter Card (~42% width on desktop)               */}
            {/* =================================================================== */}
            <div className="lg:col-span-5">
              <div className="rounded-[20px] border border-blue-100/80 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Stay Ahead of What&apos;s Next.
                  </h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Get new product announcements, technology insights, and special offers delivered to your inbox.
                </p>

                {/* Newsletter Form: Explicit label, disabled state with honest message */}
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="space-y-3"
                  aria-label="Newsletter subscription"
                >
                  <div className="space-y-1.5">
                    <label htmlFor="newsletter-email" className="block text-xs font-semibold text-slate-700">
                      Email Address
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        id="newsletter-email"
                        type="email"
                        placeholder="Enter your email address"
                        disabled
                        aria-disabled="true"
                        className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder:text-slate-400 cursor-not-allowed focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="h-11 px-6 rounded-xl bg-slate-200 text-slate-500 font-bold text-sm cursor-not-allowed shrink-0 transition-colors"
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 pt-1">
                    Newsletter subscription service coming soon.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
