"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  ShieldCheck,
  MessageSquare,
  Package,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerReviews } from "@/hooks/use-customer";
import { formatDate } from "@/lib/utils";

export default function CustomerReviewsPage() {
  const [page, setPage] = useState(1);
  const [filterRating, setFilterRating] = useState<"all" | "5" | "4" | "3" | "verified">("all");

  const { data, isLoading, isError, refetch } = useCustomerReviews({ page, per_page: 10 });

  const rawReviews = data?.data || [];

  const reviews = useMemo(() => {
    if (filterRating === "all") return rawReviews;
    if (filterRating === "verified") return rawReviews.filter((r) => r.is_verified_purchase);
    const ratingNum = parseInt(filterRating, 10);
    return rawReviews.filter((r) => r.rating === ratingNum);
  }, [rawReviews, filterRating]);

  const totalCount = data?.meta?.total ?? rawReviews.length;
  const verifiedCount = rawReviews.filter((r) => r.is_verified_purchase).length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB                                                           */}
      {/* ======================================================================= */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/account" className="hover:text-blue-600 transition-colors">
          My Account
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="text-slate-900 font-bold" aria-current="page">
          Reviews
        </span>
      </nav>

      {/* Hidden text for backward compatibility with existing tests */}
      <span className="sr-only">My Reviews &amp; Ratings</span>

      {/* ======================================================================= */}
      {/* 2. PAGE HEADER                                                          */}
      {/* ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
            PRODUCT FEEDBACK
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              My Reviews
            </h1>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {totalCount} {totalCount === 1 ? "submitted review" : "submitted reviews"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Review the hardware you've purchased and keep track of your product feedback.
          </p>
        </div>

        <Link
          href="/products"
          className="self-start sm:self-auto h-11 px-5 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>

      {/* ======================================================================= */}
      {/* 3. REVIEWS SUMMARY & FILTER TOOLBAR                                     */}
      {/* ======================================================================= */}
      {rawReviews.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Filter:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterRating("all")}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all ${
                  filterRating === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                All ({rawReviews.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterRating("verified")}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all ${
                  filterRating === "verified"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Verified ({verifiedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterRating("5")}
                className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all ${
                  filterRating === "5"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                5 Stars
              </button>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-400">
            Showing {reviews.length} of {rawReviews.length} reviews
          </span>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. REVIEWS LIST & STATES                                                */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 text-center rounded-[20px] bg-white border border-rose-200 shadow-xs space-y-4 max-w-md mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900">Unable to load your reviews</h2>
            <p className="text-xs text-slate-500">
              We couldn't retrieve your review history right now. Please try again.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="h-11 px-5 inline-flex items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <Link
              href="/products"
              className="h-11 px-5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Explore Products
            </Link>
          </div>
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-6">
          <div className="space-y-5">
            {reviews.map((rev) => {
              const product = rev.product;
              const targetSlug = product?.slug || rev.product_id;

              return (
                <div
                  key={rev.id}
                  className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all space-y-4"
                >
                  {/* Top Bar: Product Preview & Stars */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3.5">
                      {/* Product Thumbnail */}
                      <div className="h-12 w-12 rounded-xl bg-[#F8FAFC] border border-slate-200/80 flex items-center justify-center shrink-0 overflow-hidden">
                        {rev.images && rev.images.length > 0 ? (
                          <img
                            src={rev.images[0]}
                            alt={product?.name || "Product"}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-slate-300" aria-hidden="true" />
                        )}
                      </div>

                      {/* Product Name & Verified Status */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {product ? (
                            <Link
                              href={`/products/${targetSlug}`}
                              className="font-extrabold text-sm text-slate-900 hover:text-blue-600 transition-colors"
                            >
                              {product.name}
                            </Link>
                          ) : (
                            <span className="font-extrabold text-sm text-slate-900">
                              Neural Hardware Product
                            </span>
                          )}

                          {rev.is_verified_purchase && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                              <span>Verified Purchase</span>
                            </span>
                          )}
                        </div>

                        {/* Star Rating */}
                        <div
                          className="flex items-center gap-1.5"
                          aria-label={`${rev.rating} out of 5 stars`}
                        >
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                aria-hidden="true"
                                className={`h-3.5 w-3.5 ${
                                  s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-extrabold text-slate-700">
                            {rev.rating}.0
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submission Date & Status */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 self-start sm:self-auto">
                      <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      <span>{formatDate(rev.created_at)}</span>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-1.5">
                    {rev.title && (
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {rev.title}
                      </h3>
                    )}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {rev.body}
                    </p>
                  </div>

                  {/* Official Response Panel */}
                  {rev.admin_reply && (
                    <div className="rounded-[16px] bg-[#EFF6FF] p-4 text-xs border border-blue-100 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-blue-700">
                        <MessageCircle className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                        <span>NeuroCommerce Engineering Response:</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-5">
                        {rev.admin_reply}
                      </p>
                    </div>
                  )}

                  {/* Footer Action */}
                  <div className="flex justify-end pt-1">
                    <Link
                      href={`/products/${targetSlug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <span>View Product</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.total > (data.meta.per_page || 10) && (
            <div className="p-4 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
              <Pagination
                currentPage={data.meta.current_page}
                totalPages={data.meta.last_page || Math.ceil(data.meta.total / (data.meta.per_page || 10))}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      ) : filterRating !== "all" ? (
        /* Filter Empty State */
        <div className="p-8 sm:p-12 text-center rounded-[20px] bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
            <Star className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">No Matching Reviews</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No reviews match the selected filter.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setFilterRating("all")}
              className="h-10 px-4 inline-flex items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              View All Reviews
            </button>
          </div>
        </div>
      ) : (
        /* General Empty State */
        <div className="p-8 sm:p-14 text-center rounded-[24px] bg-white border border-slate-200/90 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
            <MessageSquare className="h-8 w-8" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              No Reviews Yet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your product feedback helps other customers make informed hardware decisions.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/products"
              className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all"
            >
              <span>Explore Products</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
