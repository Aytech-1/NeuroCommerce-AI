"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star, Radio } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ProductItem } from "@/services/catalog-service";
import { useAddToCart } from "@/hooks/use-storefront";
import { useState } from "react";

interface ProductCardProps {
  product: ProductItem;
  rating?: number;
  reviewsCount?: number;
}

export function ProductCard({ product, rating = 4.8, reviewsCount }: ProductCardProps) {
  const addToCartMutation = useAddToCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const price = product.sale_price ?? product.base_price;
  const isOnSale = Boolean(product.sale_price && product.sale_price < product.base_price);
  const isOutOfStock =
    product.stock_status === "out_of_stock" ||
    (product.stock_quantity !== undefined && product.stock_quantity <= 0);
  const isLowStock =
    !isOutOfStock &&
    product.stock_quantity !== undefined &&
    product.stock_quantity > 0 &&
    product.stock_quantity <= 5;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  // Determine displayed review count or fallback
  const displayReviewCount = reviewsCount !== undefined ? reviewsCount : 24;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-slate-200/90 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
      {/* ======================================================================= */}
      {/* Top Image Container (1:1 Aspect, #F8FAFC background, rounded top)       */}
      {/* ======================================================================= */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F8FAFC] rounded-t-[20px] flex items-center justify-center p-5">
        <Link href={`/products/${product.slug}`} className="block h-full w-full relative">
          {product.primary_image?.url ? (
            <img
              src={product.primary_image.url}
              alt={product.primary_image.alt_text || product.name}
              className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            /* Elegant hardware fallback vector artwork */
            <div className="flex h-full w-full items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-blue-50/80 border border-blue-100 flex items-center justify-center">
                <Radio className="h-12 w-12 text-blue-500" />
              </div>
            </div>
          )}
        </Link>

        {/* Featured Pill Badge (Top-Left) */}
        {product.is_featured && (
          <div className="absolute top-3.5 left-3.5 pointer-events-none">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
              Featured
            </span>
          </div>
        )}

        {/* Wishlist Button (Top-Right) */}
        <button
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200/80 shadow-2xs transition-all hover:border-blue-300 hover:text-blue-600 active:scale-90"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-600 hover:text-rose-500"
            }`}
          />
        </button>
      </div>

      {/* ======================================================================= */}
      {/* Product Information                                                     */}
      {/* ======================================================================= */}
      <div className="flex flex-1 flex-col justify-between p-5 pt-4">
        <div>
          {/* Category */}
          {product.category && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
              {product.category.name}
            </span>
          )}

          {/* Product Name */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating & Review Count */}
          <div
            className="flex items-center gap-1.5 mt-2"
            aria-label={`Rated ${rating} out of 5 stars from ${displayReviewCount} reviews`}
          >
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">
              {rating} <span className="text-slate-400 font-normal">({displayReviewCount})</span>
            </span>
          </div>
        </div>

        {/* Price, Stock State & Add to Cart Action */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          {/* Pricing Row */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(price)}
            </span>
            {isOnSale && (
              <span className="text-xs sm:text-sm text-slate-400 line-through">
                {formatCurrency(product.base_price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-1.5 mt-2">
            {isOutOfStock ? (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
                <span className="text-xs font-semibold text-rose-600">Out of Stock</span>
              </>
            ) : isLowStock ? (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-amber-600">
                  Low Stock ({product.stock_quantity} left)
                </span>
              </>
            ) : (
              <>
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-slate-600">In Stock</span>
              </>
            )}
          </div>

          {/* Add to Cart CTA Button */}
          <button
            onClick={handleQuickAdd}
            aria-label="Add to cart"
            disabled={isOutOfStock || addToCartMutation.isPending}
            className={`mt-4 w-full h-11 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all shadow-xs ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-blue-500/15"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
