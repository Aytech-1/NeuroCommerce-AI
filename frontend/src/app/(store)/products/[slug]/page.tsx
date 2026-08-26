"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  BadgeCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  Maximize2,
  X,
  Headphones,
  Cpu,
  Layers,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/store/product-card";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  useProductBySlug,
  useProductReviews,
  useSimilarRecommendations,
  useAddToCart,
  useToggleWishlist,
} from "@/hooks/use-storefront";
import { ProductVariant } from "@/services/catalog-service";

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const { data: product, isLoading, isError, refetch } = useProductBySlug(slug);
  const { data: reviewsData } = useProductReviews(product?.id || "");
  const { data: similarProducts } = useSimilarRecommendations(product?.id || "", 4);

  const addToCartMutation = useAddToCart();
  const wishlistMutation = useToggleWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen py-10">
        <Container className="space-y-10">
          <Skeleton className="h-4 w-64 rounded-md" />
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-4">
              <Skeleton className="aspect-square w-full rounded-[24px]" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-20 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-10 w-4/5 rounded-xl" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="bg-white min-h-[70vh] flex items-center justify-center py-16">
        <Container className="text-center max-w-md space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
            <Cpu className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Product Not Found</h1>
          <p className="text-sm text-slate-500">
            The requested hardware model could not be located or may have been updated.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/products"
              className="inline-flex h-11 items-center justify-center px-6 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              Browse All Products
            </Link>
            <button
              onClick={() => refetch()}
              className="inline-flex h-11 items-center justify-center px-5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Retry
            </button>
          </div>
        </Container>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.primary_image
      ? [
          {
            id: "primary",
            url: product.primary_image.url,
            alt_text: product.primary_image.alt_text,
            is_primary: true,
            sort_order: 0,
          },
        ]
      : [];

  const activePrice = selectedVariant?.price ?? product.sale_price ?? product.base_price;
  const comparePrice =
    selectedVariant?.compare_at_price ??
    product.compare_at_price ??
    (product.sale_price ? product.base_price : null);
  const isOnSale = Boolean(comparePrice && comparePrice > activePrice);
  const isOutOfStock =
    product.stock_status === "out_of_stock" ||
    (product.stock_quantity !== undefined && product.stock_quantity <= 0);
  const inStock = !isOutOfStock;

  const currentImage = images[selectedImageIndex] || images[0];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCartMutation.mutate({
      productId: product.id,
      quantity,
      variantId: selectedVariant?.id,
    });
  };

  const handleWishlistToggle = () => {
    wishlistMutation.mutate({
      productId: product.id,
      isWishlisted,
    });
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="bg-white min-h-screen py-8 lg:py-12">
      <Container className="space-y-12 lg:space-y-16">
        {/* ======================================================================= */}
        {/* 1. BREADCRUMB NAVIGATION                                                */}
        {/* ======================================================================= */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
          <Link href="/products" className="hover:text-blue-600 transition-colors">
            Catalog
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
              <Link
                href="/products"
                className="hover:text-blue-600 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-sm">
            {product.name}
          </span>
        </nav>

        {/* ======================================================================= */}
        {/* 2. MAIN PRODUCT PURCHASE AREA (55% GALLERY / 45% INFO)                  */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* --------------------------------------------------------------------- */}
          {/* LEFT: PRODUCT IMAGE GALLERY (7 cols on desktop)                       */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Main Image Frame */}
            <div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-[#F8FAFC] border border-slate-200/90 p-8 flex items-center justify-center shadow-2xs group">
              {currentImage?.url ? (
                <img
                  src={currentImage.url}
                  alt={currentImage.alt_text || product.name}
                  className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <Cpu className="h-20 w-20 text-slate-400/50" aria-hidden="true" />
                </div>
              )}

              {/* On Sale Pill Badge */}
              {isOnSale && (
                <span className="absolute top-5 left-5 inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-sm uppercase tracking-wide">
                  Sale Offer
                </span>
              )}

              {/* Lightbox Trigger Button */}
              {currentImage?.url && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-slate-700 shadow-md backdrop-blur-xs hover:bg-white hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Enlarge image"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-[#F8FAFC] p-1 transition-all ${
                      selectedImageIndex === idx
                        ? "border-blue-600 ring-2 ring-blue-500/20 shadow-xs"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Select product image ${idx + 1}`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text || `Thumbnail ${idx + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* RIGHT: PRODUCT INFO & COMMERCIAL PURCHASE PANEL (5 cols on desktop)   */}
          {/* --------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header: Brand & SKU */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                {product.brand ? (
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    {product.brand.name}
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    NeuroCommerce
                  </span>
                )}
                <span className="font-mono text-xs text-slate-600 font-medium">
                  SKU: {selectedVariant?.sku ?? product.sku}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Star Rating Overview */}
              <div className="flex items-center gap-2 pt-1">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-800">5.0</span>
                <a
                  href="#customer-reviews"
                  className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
                >
                  ({reviewsData?.meta?.total ?? reviewsData?.data?.length ?? 12} customer reviews)
                </a>
              </div>
            </div>

            {/* Price Presentation Block */}
            <div className="flex items-baseline gap-3 p-5 rounded-[20px] bg-[#F8FAFC] border border-slate-200/80">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(activePrice)}
              </span>
              {isOnSale && comparePrice && (
                <>
                  <span className="text-sm sm:text-base font-semibold text-slate-400 line-through">
                    {formatCurrency(comparePrice)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Save {Math.round(((comparePrice - activePrice) / comparePrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Variant Configuration */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  Configuration / Model:
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.id === v.id;
                    const label =
                      v.attribute_values?.map((a) => a.value).join(" / ") || v.sku;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariant(isSelected ? null : v)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Stock Indicator */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between gap-4">
                {/* Quantity Control */}
                <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors font-bold text-sm"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors font-bold text-sm"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Stock Status Badge */}
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {inStock ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      <span className="text-emerald-700">In Stock &amp; Ready to Ship</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-rose-600" aria-hidden="true" />
                      <span className="text-rose-700">Currently Out of Stock</span>
                    </>
                  )}
                </div>
              </div>

              {/* Add to Cart & Wishlist Actions (48px+ min target) */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock || addToCartMutation.isPending}
                  className="flex-1 h-13 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm sm:text-base font-bold text-white shadow-md hover:bg-blue-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                  <span>{addToCartMutation.isPending ? "Adding to Cart..." : "Add to Cart"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  aria-label="Wishlist"
                  className="h-13 w-13 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs shrink-0"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-600"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Purchase Trust & Reassurance Strip */}
            <div className="grid grid-cols-2 gap-3.5 pt-6 border-t border-slate-100 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600 shrink-0" aria-hidden="true" />
                <span>Express Laboratory Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" aria-hidden="true" />
                <span>2-Year Hardware Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-blue-600 shrink-0" aria-hidden="true" />
                <span>Verified OEM Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-blue-600 shrink-0" aria-hidden="true" />
                <span>30-Day Hassle-Free Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3. TECHNICAL SPECIFICATIONS & OVERVIEW                                   */}
        {/* ======================================================================= */}
        {product.description && (
          <div className="pt-12 border-t border-slate-200">
            <div className="rounded-[24px] border border-slate-200/90 bg-white p-8 sm:p-10 shadow-xs space-y-6">
              <div className="flex items-center gap-2 text-blue-600">
                <Layers className="h-5 w-5" aria-hidden="true" />
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Technical Specifications &amp; Overview
                </h2>
              </div>
              <div className="prose prose-slate max-w-none text-sm text-slate-600 leading-relaxed">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>

              {/* Structured Key Specs Table */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100">
                  <span className="font-semibold text-slate-500 block">Product SKU</span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{product.sku}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100">
                  <span className="font-semibold text-slate-500 block">Category</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{product.category?.name || "Neural Hardware"}</span>
                </div>
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-100">
                  <span className="font-semibold text-slate-500 block">Manufacturer</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{product.brand?.name || "NeuroCommerce Partner"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 4. CUSTOMER REVIEWS & ENDORSEMENTS                                      */}
        {/* ======================================================================= */}
        <div id="customer-reviews" className="pt-12 border-t border-slate-200 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1.5 block">
                LABORATORY FEEDBACK
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Customer Endorsements &amp; Reviews
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Verified feedback from research labs and clinical neuroscientists
              </p>
            </div>
          </div>

          {reviewsData?.data && reviewsData.data.length > 0 ? (
            <div className="space-y-4">
              {reviewsData.data.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-[20px] border border-slate-200/90 bg-white shadow-xs space-y-3.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${
                              s <= rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <span className="font-bold text-sm text-slate-900">
                        {rev.user ? `${rev.user.first_name} ${rev.user.last_name}` : "Verified Neuroscientist"}
                      </span>
                      {rev.is_verified_purchase && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                          <span>Verified Purchase</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(rev.created_at)}</span>
                  </div>

                  {rev.title && (
                    <h3 className="font-bold text-sm text-slate-900">{rev.title}</h3>
                  )}
                  <p className="text-sm text-slate-600 leading-relaxed">{rev.body}</p>

                  {rev.admin_reply && (
                    <div className="rounded-xl bg-[#F8FAFC] p-4 text-xs border border-slate-200 mt-3">
                      <span className="font-bold text-blue-600 block mb-1">
                        NeuroCommerce Engineering Response:
                      </span>
                      <p className="text-slate-600">{rev.admin_reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center rounded-[20px] bg-[#F8FAFC] border border-slate-200 text-slate-500 text-sm">
              No customer reviews recorded yet for this specification.
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* 5. SIMILAR / RELATED HARDWARE RECOMMENDATIONS                           */}
        {/* ======================================================================= */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="pt-12 border-t border-slate-200 space-y-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Related Neural Hardware
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </Container>

      {/* ========================================================================= */}
      {/* LIGHTBOX DIALOG                                                           */}
      {/* ========================================================================= */}
      {lightboxOpen && currentImage?.url && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged product image"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4"
        >
          <div className="absolute inset-0" onClick={() => setLightboxOpen(false)} aria-hidden="true" />
          <div className="relative z-10 max-w-4xl max-h-[90vh] bg-white rounded-[24px] p-6 shadow-2xl overflow-hidden flex flex-col items-center">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Close enlarged view"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={currentImage.url}
              alt={currentImage.alt_text || product.name}
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
