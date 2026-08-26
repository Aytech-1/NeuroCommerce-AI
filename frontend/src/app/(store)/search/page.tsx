"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { Search, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/store/product-card";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useSearchProducts } from "@/hooks/use-storefront";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");

  const { data, isLoading, isError } = useSearchProducts(initialQuery, {
    page,
    per_page: 12,
    sort,
  });

  return (
    <div className="py-8 space-y-8">
      <Container className="space-y-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <Link href="/" className="hover:text-slate-700 dark:hover:text-slate-200">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="hover:text-slate-700 dark:hover:text-slate-200">
            Catalog
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 font-semibold dark:text-slate-100">Search Results</span>
        </nav>

        {/* Search Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-6 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {initialQuery ? (
                <>
                  Search Results for <span className="text-indigo-600 dark:text-indigo-400">"{initialQuery}"</span>
                </>
              ) : (
                "Search Catalog"
              )}
            </h1>
            {data?.meta && (
              <p className="text-xs text-slate-500 mt-1">
                Found {data.meta.total} matching hardware specification{data.meta.total === 1 ? "" : "s"}
              </p>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Popularity</option>
          </select>
        </div>

        {/* Search Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-500">Failed to execute catalog search.</div>
        ) : data?.data && data.data.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {data.data.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {data.meta && (
              <Card className="p-4 rounded-2xl">
                <Pagination
                  currentPage={data.meta.current_page}
                  totalPages={data.meta.last_page || Math.ceil(data.meta.total / (data.meta.per_page || 12))}
                  onPageChange={(p) => setPage(p)}
                />
              </Card>
            )}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No Results Found"
            description={`No hardware models matched "${initialQuery}". Try searching for EEG, sensors, or cortex.`}
            actionLabel="Browse Full Catalog"
            onAction={() => {
              window.location.href = "/products";
            }}
          />
        )}
      </Container>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading search...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
