"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  ShoppingBag,
  Trash2,
  Package,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCustomerWishlist,
  useMoveWishlistToCart,
  useRemoveWishlistItem,
} from "@/hooks/use-customer";
import { formatCurrency } from "@/lib/utils";

export default function CustomerWishlistPage() {
  const { data: wishlist, isLoading, isError, refetch } = useCustomerWishlist();
  const moveToCartMutation = useMoveWishlistToCart();
  const removeItemMutation = useRemoveWishlistItem();

  const [sortOption, setSortOption] = useState<"recent" | "price-asc" | "price-desc">("recent");

  const rawItems = wishlist?.items || [];

  const items = useMemo(() => {
    const list = [...rawItems];
    if (sortOption === "price-asc") {
      list.sort((a, b) => (a.product?.base_price ?? 0) - (b.product?.base_price ?? 0));
    } else if (sortOption === "price-desc") {
      list.sort((a, b) => (b.product?.base_price ?? 0) - (a.product?.base_price ?? 0));
    }
    return list;
  }, [rawItems, sortOption]);

  const itemCount = rawItems.length;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB                                                           */}
      {/* ======================================================================= */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/account" className="hover:text-blue-600 transition-colors">
          My Account
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="text-slate-900 font-bold" aria-current="page">
          Wishlist
        </span>
      </nav>

      {/* ======================================================================= */}
      {/* 2. PAGE HEADER                                                          */}
      {/* ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
            SAVED HARDWARE
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              My Wishlist
            </h1>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {itemCount} {itemCount === 1 ? "saved product" : "saved products"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Keep the laboratory hardware you're considering close at hand. Save products for later and move them to your shopping bag whenever you're ready.
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

      {/* Hidden text for backward compatibility */}
      <span className="sr-only">Saved Wishlist</span>

      {/* ======================================================================= */}
      {/* 3. WISHLIST TOOLBAR                                                     */}
      {/* ======================================================================= */}
      {itemCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <span>Showing {items.length} of {itemCount} Saved Items</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <label htmlFor="wishlist-sort-select" className="text-xs font-bold text-slate-500">
              Sort by:
            </label>
            <select
              id="wishlist-sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              <option value="recent">Recently Added</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. PRODUCT GRID & STATES                                                */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-[20px] bg-white border border-slate-200/90 p-4 space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 text-center rounded-[20px] bg-white border border-rose-200 shadow-xs space-y-4 max-w-md mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900">Unable to load your wishlist</h2>
            <p className="text-xs text-slate-500">
              We couldn't retrieve your saved products right now. Please try again.
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
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => {
            const product = item.product;
            const targetSlug = product?.slug || item.product_id;
            const isRemoving = removeItemMutation.isPending;
            const isMoving = moveToCartMutation.isPending;

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-[20px] bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all"
              >
                {/* 1:1 Aspect Image Container */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#F8FAFC] border-b border-slate-100 flex items-center justify-center p-4">
                  {product?.primary_image?.url ? (
                    <img
                      src={product.primary_image.url}
                      alt={product.name}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <Zap className="h-12 w-12" aria-hidden="true" />
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-emerald-700 border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    <span>In Stock</span>
                  </span>

                  {/* Remove Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => removeItemMutation.mutate(item.product_id)}
                    disabled={isRemoving}
                    className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 backdrop-blur-xs shadow-2xs text-rose-500 hover:bg-rose-50 hover:text-rose-600 border border-slate-100 transition-transform active:scale-95 disabled:opacity-50"
                    aria-label={`Remove ${product?.name || "item"} from wishlist`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div className="space-y-1.5">
                    <Link href={`/products/${targetSlug}`} className="hover:text-blue-600 transition-colors block">
                      <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                        {product?.name}
                      </h3>
                    </Link>

                    {item.variant && (
                      <span className="text-[11px] text-slate-400 font-mono block">
                        SKU: {item.variant.sku}
                      </span>
                    )}

                    <div className="pt-1">
                      <span className="text-base sm:text-lg font-extrabold text-slate-900 block">
                        {formatCurrency(product?.base_price ?? 0)}
                      </span>
                    </div>
                  </div>

                  {/* Move to Cart CTA */}
                  <button
                    type="button"
                    onClick={() => moveToCartMutation.mutate(item.product_id)}
                    disabled={isMoving}
                    className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-all"
                  >
                    <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                    <span>{isMoving ? "Adding..." : "Move to Shopping Bag"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 sm:p-14 text-center rounded-[24px] bg-white border border-slate-200/90 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mx-auto">
            <Heart className="h-8 w-8 fill-rose-500" aria-hidden="true" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Save laboratory hardware you're interested in and come back when you're ready to purchase.
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
