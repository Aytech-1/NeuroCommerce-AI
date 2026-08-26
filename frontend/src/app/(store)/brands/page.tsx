"use client";

import Link from "next/link";
import {
  Building2,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useBrands } from "@/hooks/use-storefront";
import { BrandItem } from "@/services/catalog-service";

// Helper to extract deterministic 2-letter initials from brand name
function getBrandInitials(name: string): string {
  if (!name) return "NC";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function BrandsDirectoryPage() {
  const { data: brands, isLoading, isError, refetch } = useBrands();

  const totalBrands = brands?.length ?? 0;

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
            Brands
          </span>
        </nav>

        {/* ======================================================================= */}
        {/* 2. EXECUTIVE BRAND DIRECTORY HERO                                       */}
        {/* ======================================================================= */}
        <section className="relative overflow-hidden rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-10 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>BRAND DIRECTORY</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Explore Brands
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Discover certified neuroscience hardware manufacturers, neural engineering laboratories, and research instrumentation brands available through NeuroCommerce. All featured manufacturers meet strict calibration and clinical safety benchmarks.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-blue-50/60 border border-blue-100/80 shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Verified Partners
                </p>
                <p className="text-base sm:text-lg font-black text-slate-900">
                  {isLoading ? "Loading..." : `${totalBrands} Manufacturers`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 3. BRAND DISCOVERY GRID / LOADING / ERROR / EMPTY STATES                */}
        {/* ======================================================================= */}
        {isLoading ? (
          /* Geometry-matched Skeleton Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4"
              >
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Non-technical Error State */
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-10 sm:p-12 text-center shadow-2xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mb-4">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Unable to load brands</h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
              We encountered an issue retrieving manufacturer information. Please check your connection or try again.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Retry</span>
              </button>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <span>Browse Products</span>
              </Link>
            </div>
          </div>
        ) : brands && brands.length > 0 ? (
          /* Responsive 4-column Brand Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {brands.map((brand: BrandItem) => {
              const initials = getBrandInitials(brand.name);

              return (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-slate-200/90 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <div className="space-y-4">
                    {/* Brand Logo / Monogram Container */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50/70 border border-blue-100/80 text-blue-600 font-black text-lg tracking-tight transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                      <span>{initials}</span>
                    </div>

                    {/* Brand Title & Description */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {brand.name}
                        </h2>
                        {brand.is_active && (
                          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" aria-label="Verified Manufacturer" />
                        )}
                      </div>

                      {brand.description ? (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1.5">
                          {brand.description}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic mt-1.5">
                          Certified neural hardware and medical-grade research equipment.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Metadata & Navigation Affordance */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-700 block">
                        {brand.products_count !== undefined
                          ? `${brand.products_count} ${brand.products_count === 1 ? "Product" : "Products"}`
                          : "Verified Brand"}
                      </span>
                      {brand.website_url && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <span>Official Site</span>
                          <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                        </span>
                      )}
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border border-slate-200/80 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-2xs">
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty Brands State */
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-12 text-center shadow-2xs">
            <EmptyState
              icon={Building2}
              title="No Brands Available"
              description="Manufacturer profiles are currently being indexed. Please check back shortly or browse all available products."
              actionLabel="Browse Products"
              actionHref="/products"
            />
          </div>
        )}
      </Container>
    </div>
  );
}
