"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import {
  Search,
  ChevronRight,
  SlidersHorizontal,
  X,
  Sparkles,
  ArrowUpDown,
  Filter,
  Check,
  RefreshCw,
  AlertCircle,
  Tag,
  Layers,
  Coins,
  Radio,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/store/product-card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSearchProducts,
  useCategoriesTree,
  useBrands,
} from "@/hooks/use-storefront";
import { formatCurrency } from "@/lib/utils";

function SearchResultsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL State
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialBrand = searchParams.get("brand") || "";
  const initialMinPrice = searchParams.get("min_price") ? Number(searchParams.get("min_price")) : undefined;
  const initialMaxPrice = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
  const initialInStock = searchParams.get("in_stock") === "true";
  const initialSort = searchParams.get("sort") || "newest";
  const initialPage = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

  // Local State
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [priceMinInput, setPriceMinInput] = useState<string>(initialMinPrice ? String(initialMinPrice) : "");
  const [priceMaxInput, setPriceMaxInput] = useState<string>(initialMaxPrice ? String(initialMaxPrice) : "");

  // Update search input if URL changes externally
  useEffect(() => {
    setSearchInput(initialQuery);
  }, [initialQuery]);

  // Sync price inputs when URL changes
  useEffect(() => {
    setPriceMinInput(initialMinPrice ? String(initialMinPrice) : "");
    setPriceMaxInput(initialMaxPrice ? String(initialMaxPrice) : "");
  }, [initialMinPrice, initialMaxPrice]);

  // Facet data queries
  const { data: categories } = useCategoriesTree();
  const { data: brands } = useBrands();

  // Primary search query
  const queryParams = useMemo(
    () => ({
      page: initialPage,
      per_page: 12,
      category: initialCategory || undefined,
      brand: initialBrand || undefined,
      price_min: initialMinPrice,
      price_max: initialMaxPrice,
      in_stock: initialInStock || undefined,
      sort: initialSort,
    }),
    [
      initialPage,
      initialCategory,
      initialBrand,
      initialMinPrice,
      initialMaxPrice,
      initialInStock,
      initialSort,
    ]
  );

  const { data, isLoading, isError, refetch, isFetching } = useSearchProducts(
    initialQuery,
    queryParams
  );

  // Helper to push updated query parameters to the URL
  const updateUrlParams = (updates: Record<string, string | number | boolean | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "" || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  // Search submission handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchInput.trim() || null, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateUrlParams({ q: null, page: 1 });
  };

  const handleCategorySelect = (slug: string) => {
    updateUrlParams({
      category: initialCategory === slug ? null : slug,
      page: 1,
    });
  };

  const handleBrandSelect = (slug: string) => {
    updateUrlParams({
      brand: initialBrand === slug ? null : slug,
      page: 1,
    });
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({
      min_price: priceMinInput ? Number(priceMinInput) : null,
      max_price: priceMaxInput ? Number(priceMaxInput) : null,
      page: 1,
    });
  };

  const handleToggleInStock = () => {
    updateUrlParams({
      in_stock: !initialInStock ? true : null,
      page: 1,
    });
  };

  const handleSortChange = (newSort: string) => {
    updateUrlParams({ sort: newSort, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
  };

  const handleClearAllFilters = () => {
    setSearchInput("");
    setPriceMinInput("");
    setPriceMaxInput("");
    router.push(pathname);
  };

  // Active filters count
  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; onRemove: () => void }[] = [];

    if (initialCategory) {
      const catObj = categories?.find((c) => c.slug === initialCategory || c.id === initialCategory);
      list.push({
        key: "category",
        label: `Category: ${catObj ? catObj.name : initialCategory}`,
        onRemove: () => updateUrlParams({ category: null, page: 1 }),
      });
    }

    if (initialBrand) {
      const brdObj = brands?.find((b) => b.slug === initialBrand || b.id === initialBrand);
      list.push({
        key: "brand",
        label: `Brand: ${brdObj ? brdObj.name : initialBrand}`,
        onRemove: () => updateUrlParams({ brand: null, page: 1 }),
      });
    }

    if (initialMinPrice !== undefined || initialMaxPrice !== undefined) {
      let priceLabel = "Price: ";
      if (initialMinPrice !== undefined && initialMaxPrice !== undefined) {
        priceLabel += `${formatCurrency(initialMinPrice)} - ${formatCurrency(initialMaxPrice)}`;
      } else if (initialMinPrice !== undefined) {
        priceLabel += `≥ ${formatCurrency(initialMinPrice)}`;
      } else if (initialMaxPrice !== undefined) {
        priceLabel += `≤ ${formatCurrency(initialMaxPrice)}`;
      }
      list.push({
        key: "price",
        label: priceLabel,
        onRemove: () => updateUrlParams({ min_price: null, max_price: null, page: 1 }),
      });
    }

    if (initialInStock) {
      list.push({
        key: "in_stock",
        label: "In Stock Only",
        onRemove: () => updateUrlParams({ in_stock: null, page: 1 }),
      });
    }

    return list;
  }, [initialCategory, initialBrand, initialMinPrice, initialMaxPrice, initialInStock, categories, brands]);

  const total = data?.meta?.total ?? data?.data?.length ?? 0;
  const lastPage = data?.meta?.last_page || 1;

  return (
    <div className="bg-[#FCFDFE] min-h-screen py-8 space-y-8">
      <Container className="space-y-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link href="/products" className="hover:text-slate-900 transition-colors">
            Catalog
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Product Search & Discovery
          </span>
        </nav>

        {/* Search Input Hero Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Search neural headsets, EEG sensors, biometric implants, smart wearables..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-9 h-11 text-xs sm:text-sm rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 transition-all"
                aria-label="Search product catalog"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label="Clear search input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              variant="primary"
              className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shrink-0 shadow-xs"
            >
              Search
            </Button>
          </form>

          {/* Search Context Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                {initialQuery ? (
                  <>
                    Results for <span className="text-blue-600">"{initialQuery}"</span>
                  </>
                ) : (
                  "Catalog Search & Discovery"
                )}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isLoading
                  ? "Querying authoritative product catalog..."
                  : `Found ${total} matching specification${total === 1 ? "" : "s"}`}
              </p>
            </div>

            {/* Sort Dropdown & Mobile Filter Trigger */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden text-xs border-slate-300 font-semibold"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
              </Button>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={initialSort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 shadow-2xs"
                  aria-label="Sort products by"
                >
                  <option value="newest">Newest Additions</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name_asc">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-400 text-[11px] uppercase mr-1">Active Filters:</span>
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {filter.label}
                  <button
                    onClick={filter.onRemove}
                    className="hover:text-blue-900 transition-colors"
                    aria-label={`Remove filter ${filter.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearAllFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 ml-2 underline"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* 2-COLUMN LAYOUT: FACETS SIDEBAR + SEARCH GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* DESKTOP FACETED FILTERS SIDEBAR */}
          <aside className="hidden lg:block space-y-6 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Filter Catalog
                </h2>
              </div>
              {activeFilters.length > 0 && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories Facet */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-400" /> Categories
              </span>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {categories && categories.length > 0 ? (
                  categories.map((cat) => {
                    const isSelected = initialCategory === cat.slug || initialCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors text-left ${
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400">Loading categories...</span>
                )}
              </div>
            </div>

            {/* Brands Facet */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-slate-400" /> Brands
              </span>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {brands && brands.length > 0 ? (
                  brands.map((b) => {
                    const isSelected = initialBrand === b.slug || initialBrand === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => handleBrandSelect(b.slug)}
                        className={`w-full flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors text-left ${
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="truncate">{b.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-xs text-slate-400">Loading brands...</span>
                )}
              </div>
            </div>

            {/* Price Range Facet */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-slate-400" /> Price Range
              </span>
              <form onSubmit={handlePriceApply} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceMinInput}
                    onChange={(e) => setPriceMinInput(e.target.value)}
                    className="h-8 text-xs"
                    min={0}
                  />
                  <span className="text-xs text-slate-400">—</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceMaxInput}
                    onChange={(e) => setPriceMaxInput(e.target.value)}
                    className="h-8 text-xs"
                    min={0}
                  />
                </div>
                <Button type="submit" variant="outline" size="sm" className="w-full text-xs h-7">
                  Apply Price
                </Button>
              </form>
            </div>

            {/* Availability Facet */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={initialInStock}
                  onChange={handleToggleInStock}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* SEARCH RESULTS GRID AREA */}
          <main className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-96 rounded-2xl bg-white border border-slate-200/80 p-4 space-y-4 animate-pulse"
                  >
                    <div className="aspect-square bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="bg-white rounded-2xl border border-rose-200 p-12 text-center space-y-3">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Search Service Unavailable</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Unable to retrieve search results from the authoritative catalog service. Please verify your connection or retry.
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs">
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  Retry Query
                </Button>
              </div>
            ) : !data?.data || data.data.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    No matching products found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {initialQuery
                      ? `We couldn't find any specifications matching "${initialQuery}". Try adjusting your keywords or clearing active filters.`
                      : "No products match your selected filter criteria."}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  {activeFilters.length > 0 && (
                    <Button variant="outline" size="sm" onClick={handleClearAllFilters} className="text-xs font-semibold">
                      Clear All Filters
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push("/products")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    Browse Full Catalog
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {lastPage > 1 && (
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      Page <span className="font-bold text-slate-900">{initialPage}</span> of{" "}
                      <span className="font-bold text-slate-900">{lastPage}</span>
                    </div>
                    <Pagination
                      currentPage={initialPage}
                      totalPages={lastPage}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
}

export default function StorefrontSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FCFDFE] py-12">
          <Container>
            <div className="h-64 rounded-2xl bg-white border border-slate-200/80 animate-pulse" />
          </Container>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
