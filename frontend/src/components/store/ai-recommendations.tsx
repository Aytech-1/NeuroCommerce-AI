"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/store/product-card";
import { useSmartRecommendations } from "@/hooks/use-storefront";
import { useAuthStore } from "@/stores/auth-store";

export function AiRecommendations() {
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading, isError } = useSmartRecommendations(8);

  const products = data?.items ?? [];
  const isPersonalized = data?.isPersonalized ?? false;

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  const totalProducts = products.length;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < totalProducts;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex((prev) => Math.min(totalProducts - itemsPerPage, prev + 1));
    }
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <section
      id="ai-recommendations"
      aria-labelledby="ai-recommendations-heading"
      className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#F8FAFC]/80 via-white to-[#F8FAFC]/40 border-b border-slate-100 overflow-hidden"
    >
      {/* Decorative AI Neural Visual Lattice Background (aria-hidden) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-400/8 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-400/8 rounded-full blur-3xl" />

        <svg
          className="absolute inset-0 w-full h-full opacity-20 text-blue-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <defs>
            <pattern id="ai-nodes-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="currentColor" />
              <circle cx="80" cy="40" r="2" fill="currentColor" />
              <circle cx="50" cy="90" r="1.5" fill="currentColor" />
              <line x1="20" y1="20" x2="80" y2="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
              <line x1="80" y1="40" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ai-nodes-pattern)" />
        </svg>
      </div>

      <Container className="relative z-10">
        {/* ======================================================================= */}
        {/* SECTION HEADER                                                          */}
        {/* ======================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 lg:mb-12">
          <div className="max-w-2xl">
            {/* AI Status Badge */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {isPersonalized ? "PERSONALIZED SELECTION" : "AI-POWERED DISCOVERY"}
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-600 text-xs font-semibold shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                <span>{isPersonalized ? "Tailored to Your Activity" : "AI Recommendation Engine"}</span>
              </div>
            </div>

            {/* Main Heading */}
            <h2
              id="ai-recommendations-heading"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              {isPersonalized
                ? "Recommended Specifically for You"
                : "Technology Selected Intelligently for You"}
            </h2>

            {/* Supporting Text */}
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              {isPersonalized
                ? "Curated based on your browsing patterns, neuro-device preferences, and past orders."
                : "Our recommendation engine analyzes product telemetry, demand velocity, and user interest to highlight high-performance devices."}
            </p>
          </div>

          {/* Header Right: Carousel Navigation Controls & Link */}
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/recommendations"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group"
            >
              <span>Explore All Recommendations</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Carousel Previous / Next Buttons */}
            {totalProducts > itemsPerPage && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  aria-label="Previous recommendations"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 shadow-xs transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  aria-label="Next recommendations"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600 shadow-xs transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RECOMMENDATIONS GRID / STATES                                           */}
        {/* ======================================================================= */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-[20px] border border-slate-200/80 bg-white p-5 space-y-4 shadow-xs"
              >
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-full ml-4 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error Fallback State */
          <div className="p-10 rounded-3xl border border-slate-200 bg-white text-center shadow-xs">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">
              Recommendations are temporarily unavailable.
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Please browse our comprehensive catalog for popular neuroscience devices.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Browse Products</span>
              <span>→</span>
            </Link>
          </div>
        ) : totalProducts > 0 ? (
          /* Products Grid: 4 cols desktop, 2 cols tablet, 1 col mobile */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-10 rounded-3xl border border-slate-200 bg-white text-center shadow-xs">
            <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">Discover Technology You'll Love</h3>
            <p className="text-xs text-slate-500 mt-1">
              Explore our catalog and we'll help you find products that fit your needs.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Explore Catalog</span>
              <span>→</span>
            </Link>
          </div>
        )}

        {/* Mobile View All Link */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>Explore All Recommendations</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
