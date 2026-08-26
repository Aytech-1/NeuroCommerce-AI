"use client";

import Link from "next/link";
import {
  Layers,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Cpu,
  Activity,
  Radio,
  Microscope,
  Zap,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useCategoriesTree } from "@/hooks/use-storefront";

// Deterministic icon selector for category visual badges
function getCategoryIcon(name: string, index: number) {
  const normalized = name.toLowerCase();
  if (normalized.includes("sensor") || normalized.includes("electrode")) return Radio;
  if (normalized.includes("headset") || normalized.includes("interface") || normalized.includes("bci")) return Cpu;
  if (normalized.includes("telemetry") || normalized.includes("medical") || normalized.includes("signal")) return Activity;
  if (normalized.includes("lab") || normalized.includes("equipment") || normalized.includes("research")) return Microscope;
  if (normalized.includes("stimulat") || normalized.includes("power") || normalized.includes("adapter")) return Zap;

  const fallbackIcons = [Layers, Cpu, Activity, Radio, Microscope, Sparkles];
  return fallbackIcons[index % fallbackIcons.length];
}

export default function CategoriesDirectoryPage() {
  const { data: categories, isLoading, isError, refetch } = useCategoriesTree();

  const totalCategories = categories?.length ?? 0;

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
            Categories
          </span>
        </nav>

        {/* ======================================================================= */}
        {/* 2. EXECUTIVE CATEGORY HERO BANNER                                       */}
        {/* ======================================================================= */}
        <section className="relative overflow-hidden rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-10 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                <span>SHOP BY CATEGORY</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Explore Categories
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Discover products organized by category and find the equipment, technology, and supplies you need faster. Explore our full range of certified neuroscience hardware, neural interface headsets, clinical telemetry systems, and laboratory instrumentation.
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-blue-50/60 border border-blue-100/80 shrink-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Verified Collections
                </p>
                <p className="text-base sm:text-lg font-black text-slate-900">
                  {isLoading ? "Loading..." : `${totalCategories} Categories`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 3. CATEGORY DISCOVERY GRID / LOADING / ERROR / EMPTY STATES             */}
        {/* ======================================================================= */}
        {isLoading ? (
          /* Geometry-matched Skeleton Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4"
              >
                <Skeleton className="h-12 w-12 rounded-2xl" />
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
              <Layers className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Unable to load categories</h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
              We encountered an issue retrieving the category catalog. Please check your connection or try again.
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
        ) : categories && categories.length > 0 ? (
          /* Responsive 4-column Category Discovery Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat, idx) => {
              const IconComponent = getCategoryIcon(cat.name, idx);

              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-slate-200/90 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <div className="space-y-4">
                    {/* Visual Icon Badge */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
                      <IconComponent className="h-6 w-6" aria-hidden="true" />
                    </div>

                    {/* Category Title & Description */}
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {cat.name}
                      </h2>
                      {cat.description ? (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-1.5">
                          {cat.description}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 italic mt-1.5">
                          Explore neuroscience equipment and verified hardware.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer: Metadata & Arrow Affordance */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {cat.products_count !== undefined && cat.products_count > 0 ? (
                        <span className="text-xs font-bold text-slate-700">
                          {cat.products_count} <span className="text-slate-400 font-medium">Products</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">
                          Explore Catalog
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
          /* Empty Categories State */
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-12 text-center shadow-2xs">
            <EmptyState
              icon={Layers}
              title="No Categories Available"
              description="Hardware categories are currently being indexed. Please check back shortly or browse all available products."
              actionLabel="Browse All Products"
              actionHref="/products"
            />
          </div>
        )}
      </Container>
    </div>
  );
}
