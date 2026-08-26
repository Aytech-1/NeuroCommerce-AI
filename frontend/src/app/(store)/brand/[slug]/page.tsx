"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Building2,
  Search,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  X,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/store/product-card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useBrandBySlug, useBrandProducts } from "@/hooks/use-storefront";

// Helper to extract deterministic 2-letter initials from brand name
function getBrandInitials(name: string): string {
  if (!name) return "NC";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function BrandProductsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [inStockOnly, setInStockOnly] = useState(false);

  const {
    data: brand,
    isLoading: brandLoading,
    isError: brandError,
    refetch: refetchBrand,
  } = useBrandBySlug(slug);

  const {
    data: productsData,
    isLoading: prodLoading,
    isError: prodError,
    refetch: refetchProducts,
  } = useBrandProducts(slug, {
    page,
    per_page: 12,
    search: search.trim() || undefined,
    sort,
    in_stock: inStockOnly || undefined,
  });

  const isLoading = brandLoading || prodLoading;

  const handleRetry = () => {
    refetchBrand();
    refetchProducts();
  };

  const clearFilters = () => {
    setSearch("");
    setSort("newest");
    setInStockOnly(false);
    setPage(1);
  };

  const hasActiveFilters = Boolean(search.trim()) || sort !== "newest" || inStockOnly;

  // Pagination calculation
  const total = productsData?.meta?.total ?? 0;
  const perPage = productsData?.meta?.per_page ?? 12;
  const currentPage = productsData?.meta?.current_page ?? page;
  const startItem = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
  const endItem = total > 0 ? Math.min(currentPage * perPage, total) : 0;
  const totalPages =
    productsData?.meta?.last_page || (total > 0 ? Math.ceil(total / perPage) : 1);

  // Determine if brand is completely empty vs filtered empty
  const isUnfilteredEmpty = !hasActiveFilters && total === 0;

  // Full page error state when brand details fail to load
  if (brandError && !brand) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen py-8 sm:py-12">
        <Container className="space-y-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-semibold text-slate-500"
          >
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <Link href="/brands" className="hover:text-blue-600 transition-colors">
              Brands
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span aria-current="page" className="text-slate-900 font-bold truncate">
              {slug}
            </span>
          </nav>

          <div className="rounded-[20px] border border-slate-200/90 bg-white p-10 sm:p-12 text-center shadow-2xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mb-4">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Unable to load brand</h1>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
              We couldn&apos;t load details for this manufacturer. Please check your connection or try again.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Retry</span>
              </button>
              <Link
                href="/brands"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <span>All Brands</span>
              </Link>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  const initials = getBrandInitials(brand?.name || slug);

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
          <Link href="/brands" className="hover:text-blue-600 transition-colors">
            Brands
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span aria-current="page" className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-none">
            {brandLoading ? "Loading..." : brand?.name || slug}
          </span>
        </nav>

        {/* ======================================================================= */}
        {/* 2. BRAND IDENTITY HERO HEADER                                           */}
        {/* ======================================================================= */}
        {brandLoading ? (
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-10 shadow-2xs space-y-4">
            <Skeleton className="h-4 w-32 rounded-md" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            </div>
          </div>
        ) : (
          <section className="relative overflow-hidden rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-10 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-start gap-4 sm:gap-6">
                {/* Brand Monogram Badge */}
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-blue-50/80 border border-blue-100/80 text-blue-600 font-black text-xl sm:text-2xl tracking-tight shrink-0 shadow-2xs">
                  <span>{initials}</span>
                </div>

                <div className="space-y-2 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">
                    <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>MANUFACTURER / BRAND</span>
                  </span>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                      {brand?.name || "Brand Hardware"}
                    </h1>
                    {brand?.is_active && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  {brand?.description ? (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl pt-1">
                      {brand.description}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pt-1">
                      Certified neuroscience hardware and medical-grade instrumentation manufactured by {brand?.name || slug}.
                    </p>
                  )}

                  {/* Official Website CTA if Authoritative URL Exists */}
                  {brand?.website_url && (
                    <div className="pt-2">
                      <a
                        href={brand.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <span>Official Website</span>
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Authoritative Brand Metric Badge */}
              <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-blue-50/60 border border-blue-100/80 shrink-0 self-start">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Manufacturer Inventory
                  </p>
                  <p className="text-base sm:text-lg font-black text-slate-900">
                    {isLoading ? (
                      <span className="inline-block h-4 w-20 animate-pulse bg-slate-200 rounded" />
                    ) : (
                      `${total} Products`
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================================= */}
        {/* 3. DISCOVERY & FILTER TOOLBAR                                           */}
        {/* ======================================================================= */}
        <section className="rounded-[20px] border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Search within Brand */}
            <div className="flex-1 max-w-md">
              <div className="relative flex items-center w-full">
                <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                  <Search className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder={`Search products in ${brand?.name || "this brand"}...`}
                  className="w-full h-11 pl-10 pr-9 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    aria-label="Clear search query"
                    className="absolute right-3 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Controls (In-stock toggle + Sort selector + Clear button) */}
            <div className="flex flex-wrap items-center gap-3">
              {/* In-Stock Toggle Button */}
              <button
                onClick={() => {
                  setInStockOnly(!inStockOnly);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 h-11 px-4 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
                  inStockOnly
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 ${inStockOnly ? "text-blue-600" : "text-slate-400"}`} />
                <span>In Stock Only</span>
              </button>

              {/* Sort Selector */}
              <div className="relative inline-flex items-center">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Sort products"
                  className="h-11 pl-3.5 pr-9 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer appearance-none"
                >
                  <option value="newest">Sort by: Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" aria-hidden="true" />
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Status Sub-bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              {isLoading ? (
                <span className="inline-block h-3 w-32 animate-pulse bg-slate-200 rounded" />
              ) : total > 0 ? (
                <span>
                  Showing <strong className="text-slate-900">{startItem}–{endItem}</strong> of{" "}
                  <strong className="text-slate-900">{total}</strong> products
                </span>
              ) : (
                <span>0 products found</span>
              )}
            </div>

            {hasActiveFilters && (
              <span className="text-blue-600 font-semibold">
                Filters active
              </span>
            )}
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 4. PRODUCT GRID / EMPTY STATES / LOADING SKELETON                       */}
        {/* ======================================================================= */}
        {prodLoading ? (
          /* Geometry-matched Product Grid Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3"
              >
                <Skeleton className="aspect-square w-full rounded-[16px]" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-1/4" />
                <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : prodError ? (
          /* Products Load Error State */
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-10 sm:p-12 text-center shadow-2xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mb-4">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Unable to load products</h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
              We encountered an issue loading products for this manufacturer. Please try again or browse all products.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Retry</span>
              </button>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <span>Browse All Products</span>
              </Link>
            </div>
          </div>
        ) : productsData?.data && productsData.data.length > 0 ? (
          /* Product Grid with Reuse of canonical ProductCard */
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsData.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {productsData.meta && totalPages > 1 && (
              <div className="flex justify-center pt-6 border-t border-slate-200/80">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </div>
        ) : isUnfilteredEmpty ? (
          /* Unfiltered Empty State */
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-12 text-center shadow-2xs">
            <EmptyState
              icon={Building2}
              title="No Products from This Brand"
              description="There are currently no products available from this brand. Explore our full catalog to discover available neural hardware."
              actionLabel="Browse All Products"
              actionHref="/products"
            />
          </div>
        ) : (
          /* Filtered Empty State */
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-12 text-center shadow-2xs">
            <EmptyState
              icon={Search}
              title="No Matching Products"
              description="No products matched your search or filters for this brand."
              actionLabel="Clear Filters"
              onAction={clearFilters}
            />
          </div>
        )}
      </Container>
    </div>
  );
}
