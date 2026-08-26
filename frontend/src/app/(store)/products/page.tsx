"use client";

import { useState } from "react";
import { SlidersHorizontal, ArrowUpDown, RefreshCw, Search, Cpu, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/store/product-card";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { CatalogFilterDrawer } from "@/components/store/catalog-filter-drawer";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  usePublicProducts,
  useCategoriesTree,
  useBrands,
} from "@/hooks/use-storefront";

export default function StorefrontProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { data: categories } = useCategoriesTree();
  const { data: brands } = useBrands();

  const { data, isLoading, isError, refetch } = usePublicProducts({
    page,
    per_page: 12,
    search: search.trim() || undefined,
    category: category || undefined,
    brand: brand || undefined,
    price_min: minPrice,
    price_max: maxPrice,
    in_stock: inStock || undefined,
    sort,
  });

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setInStock(false);
    setSort("newest");
    setPage(1);
  };

  // Calculate active filter count for badges
  const activeFilterCount = [
    Boolean(search.trim()),
    Boolean(category),
    Boolean(brand),
    minPrice !== undefined,
    maxPrice !== undefined,
    inStock,
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0 || sort !== "newest";

  // Calculate dynamic result range from backend pagination metadata
  const total = data?.meta?.total ?? 0;
  const perPage = data?.meta?.per_page ?? 12;
  const currentPage = data?.meta?.current_page ?? page;
  const startItem = total > 0 ? (currentPage - 1) * perPage + 1 : 0;
  const endItem = total > 0 ? Math.min(currentPage * perPage, total) : 0;
  const totalPages =
    data?.meta?.last_page || (total > 0 ? Math.ceil(total / perPage) : 1);

  return (
    <div className="bg-white min-h-screen">
      {/* ========================================================================= */}
      {/* 1. CATALOG INTRODUCTION HERO                                              */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9]/60 to-white py-10 lg:py-14 border-b border-slate-100">
        <Container>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-2.5">
                <Cpu className="h-3.5 w-3.5" aria-hidden="true" />
                <span>DISCOVER TECHNOLOGY</span>
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                All Products
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Hardware Catalog</span> — Explore our complete collection of advanced neural interfaces, brainwave decoding sensors, laboratory instrumentation, and wearable technology.
              </p>
            </div>

            {/* Quick Summary Pill on Desktop */}
            <div className="hidden lg:flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Authoritative Catalog</p>
                <p className="text-sm font-extrabold text-slate-900">
                  {isLoading ? "Loading..." : `${total} Verified Devices`}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN CATALOG WORKSPACE                                                 */}
      {/* ========================================================================= */}
      <section className="py-8 lg:py-12">
        <Container>
          {/* --------------------------------------------------------------------- */}
          {/* SMART DISCOVERY TOOLBAR                                               */}
          {/* --------------------------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-slate-100">
            {/* Result Count / Status */}
            <div className="text-sm font-medium text-slate-600">
              {isLoading ? (
                <span className="inline-block h-4 w-40 animate-pulse bg-slate-200 rounded-md" />
              ) : total > 0 ? (
                <span>
                  Showing <strong className="text-slate-900">{startItem}–{endItem}</strong> of{" "}
                  <strong className="text-slate-900">{total}</strong> products
                </span>
              ) : (
                <span>No matching products</span>
              )}
            </div>

            {/* Controls: Mobile Filter Button + Sort Select */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors"
                aria-label="Open filter menu"
              >
                <SlidersHorizontal className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">
                    {activeFilterCount}
                  </span>
                )}
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
                  className="h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer appearance-none"
                >
                  <option value="newest">Sort by: Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* TWO-COLUMN LAYOUT: SIDEBAR + PRODUCT GRID                             */}
          {/* --------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Desktop Filter Sidebar (3 cols out of 12) */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-6">
              <CatalogFilters
                search={search}
                onSearchChange={(v) => {
                  setSearch(v);
                  setPage(1);
                }}
                category={category}
                onCategoryChange={(v) => {
                  setCategory(v);
                  setPage(1);
                }}
                brand={brand}
                onBrandChange={(v) => {
                  setBrand(v);
                  setPage(1);
                }}
                minPrice={minPrice}
                onMinPriceChange={(v) => {
                  setMinPrice(v);
                  setPage(1);
                }}
                maxPrice={maxPrice}
                onMaxPriceChange={(v) => {
                  setMaxPrice(v);
                  setPage(1);
                }}
                inStock={inStock}
                onInStockChange={(v) => {
                  setInStock(v);
                  setPage(1);
                }}
                categories={categories}
                brands={brands}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
              />
            </aside>

            {/* Product Area (9 cols out of 12) */}
            <div className="lg:col-span-9 space-y-8">
              {/* Product Grid / Loading / Error / Empty States */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-4 shadow-xs space-y-3"
                    >
                      <Skeleton className="aspect-square w-full rounded-[16px]" />
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-5 w-4/5" />
                      <Skeleton className="h-4 w-1/4" />
                      <div className="pt-2 flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-9 w-24 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                /* Error State */
                <div className="rounded-[20px] border border-slate-200 bg-white p-10 text-center shadow-xs">
                  <p className="text-base font-bold text-slate-900">
                    Unable to load products.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Please check your connection or try again.
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Retry</span>
                  </button>
                </div>
              ) : data?.data && data.data.length > 0 ? (
                /* Products Grid: 3 cols on desktop, 2 cols on tablet, 1-2 on mobile */
                <div className="space-y-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.data.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination Bar */}
                  {data.meta && totalPages > 1 && (
                    <div className="flex justify-center pt-6 border-t border-slate-100">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                /* Empty State */
                <div className="rounded-[20px] border border-slate-200 bg-white p-12 text-center shadow-xs">
                  <EmptyState
                    icon={Search}
                    title="No Products Found"
                    description="Try adjusting your filters or search keywords to find what you're looking for."
                    actionLabel={hasActiveFilters ? "Clear All Filters" : undefined}
                    onAction={hasActiveFilters ? clearFilters : undefined}
                  />
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* 3. MOBILE FILTER DRAWER                                                   */}
      {/* ========================================================================= */}
      <CatalogFilterDrawer
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        category={category}
        onCategoryChange={(v) => {
          setCategory(v);
          setPage(1);
        }}
        brand={brand}
        onBrandChange={(v) => {
          setBrand(v);
          setPage(1);
        }}
        minPrice={minPrice}
        onMinPriceChange={(v) => {
          setMinPrice(v);
          setPage(1);
        }}
        maxPrice={maxPrice}
        onMaxPriceChange={(v) => {
          setMaxPrice(v);
          setPage(1);
        }}
        inStock={inStock}
        onInStockChange={(v) => {
          setInStock(v);
          setPage(1);
        }}
        categories={categories}
        brands={brands}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        totalResults={total}
      />
    </div>
  );
}
