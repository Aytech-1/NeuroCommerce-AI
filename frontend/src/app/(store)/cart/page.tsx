"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Tag,
  ShieldCheck,
  Zap,
  ChevronRight,
  RotateCcw,
  Truck,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency } from "@/lib/utils";
import { notify } from "@/lib/notifications";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useApplyCoupon,
  useRemoveCoupon,
} from "@/hooks/use-cart";
import { CartItem } from "@/services/cart-service";

export default function CartPage() {
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  // Dialog state for item removal and clear cart
  const [itemToRemove, setItemToRemove] = useState<CartItem | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const { data: cart, isLoading, isError, refetch } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim();
    if (!code) return;

    applyCoupon.mutate(code, {
      onSuccess: () => {
        setCouponCode("");
        setCouponError(null);
        notify.success("Promo code applied");
      },
      onError: (err: unknown) => {
        const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
        const message =
          errorObj?.response?.data?.message ||
          "Unable to apply promo code. Please check the code and try again.";
        setCouponError(message);
        notify.error("Unable to apply promo code");
      },
    });
  };

  const handleRemoveCoupon = () => {
    removeCoupon.mutate(undefined, {
      onSuccess: () => {
        notify.success("Promo code removed");
      },
      onError: () => {
        notify.error("Unable to remove promo code");
      },
    });
  };

  const handleConfirmRemoveItem = () => {
    if (!itemToRemove) return;
    removeItem.mutate(itemToRemove.id, {
      onSuccess: () => {
        notify.success("Item removed from your shopping bag");
        setItemToRemove(null);
      },
      onError: () => {
        notify.error("Unable to remove item from shopping bag");
        setItemToRemove(null);
      },
    });
  };

  const handleConfirmClearCart = () => {
    clearCart.mutate(undefined, {
      onSuccess: () => {
        notify.success("Shopping bag cleared");
        setIsClearConfirmOpen(false);
      },
      onError: () => {
        notify.error("Unable to clear your shopping bag");
        setIsClearConfirmOpen(false);
      },
    });
  };

  const items = cart?.items || [];
  const isEmpty = items.length === 0;
  const totalItemCount = cart?.items_count ?? items.reduce((acc, i) => acc + (i.quantity || 1), 0);

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
            Shopping Bag
          </span>
        </nav>

        {/* ======================================================================= */}
        {/* 2. EXECUTIVE SHOPPING BAG HERO                                          */}
        {/* ======================================================================= */}
        <section className="relative overflow-hidden rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1.5">
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                <span>SHOPPING BAG</span>
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Your Shopping Bag
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Review your selected products before continuing to checkout.
              </p>
            </div>

            {/* Header Right Actions */}
            {!isEmpty && !isLoading && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50/70 border border-blue-100 text-xs font-bold text-blue-700">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {totalItemCount} {totalItemCount === 1 ? "item" : "items"} in your bag
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsClearConfirmOpen(true)}
                  disabled={clearCart.isPending}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-white text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors disabled:opacity-50 shadow-2xs"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Clear Bag</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 3. MAIN WORKSPACE / LOADING / ERROR / EMPTY STATES                      */}
        {/* ======================================================================= */}
        {isLoading ? (
          /* Geometry-matched Skeleton Grid */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            <div className="lg:col-span-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-5 sm:p-6 rounded-[20px] border border-slate-200/90 bg-white shadow-2xs space-y-4"
                >
                  <div className="flex gap-4">
                    <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl" />
                    <div className="flex-1 space-y-2 py-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-4">
              <div className="p-6 rounded-[20px] border border-slate-200/90 bg-white shadow-2xs space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        ) : isError ? (
          /* Non-technical Error State */
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-10 sm:p-12 text-center shadow-2xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mb-4">
              <ShoppingBag className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Unable to load your shopping bag</h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
              We couldn&apos;t retrieve your cart right now. Please check your connection or try again.
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
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        ) : isEmpty ? (
          /* Empty Shopping Bag State */
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-12 text-center shadow-2xs">
            <EmptyState
              icon={ShoppingBag}
              title="Your Shopping Bag Is Empty"
              description="Browse our catalog and add products to your bag to get started."
              actionLabel="Explore Products"
              actionHref="/products"
            />
            <div className="mt-4">
              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>Explore Categories</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          /* Main 2-Column Cart Workspace */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            {/* ------------------------------------------------------------------- */}
            {/* LEFT COLUMN: SHOPPING BAG ITEMS LIST (8 cols)                       */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-[20px] border border-slate-200/90 bg-white p-4 sm:p-6 shadow-2xs divide-y divide-slate-100">
                {items.map((item) => {
                  const product = item.product;
                  const productName = product?.name || "Neural Hardware Device";
                  const itemSubtotal = item.subtotal || item.unit_price * item.quantity;
                  const isStockAvailable = product?.stock_quantity === undefined || product.stock_quantity > 0;
                  const isLowStock = product?.stock_quantity !== undefined && product.stock_quantity > 0 && product.stock_quantity <= 5;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      {/* Left: Product Thumbnail & Details */}
                      <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                        {/* Thumbnail Container */}
                        <div className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-2 flex items-center justify-center shadow-2xs">
                          {product?.primary_image_url || product?.primary_image?.url || (product as any)?.images?.[0]?.url ? (
                            <img
                              src={product?.primary_image_url || product?.primary_image?.url || (product as any)?.images?.[0]?.url}
                              alt={productName}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400 bg-blue-50/50 rounded-xl">
                              <Zap className="h-8 w-8 text-blue-500" aria-hidden="true" />
                            </div>
                          )}
                        </div>

                        {/* Product Information */}
                        <div className="min-w-0 space-y-1">
                          {product?.brand?.name && (
                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block">
                              {product.brand.name}
                            </span>
                          )}

                          <Link
                            href={`/products/${product?.slug || item.product_id}`}
                            className="hover:text-blue-600 transition-colors block"
                          >
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                              {productName}
                            </h2>
                          </Link>

                          {item.variant && (
                            <span className="text-xs text-slate-500 font-mono block">
                              Variant: {item.variant.sku}
                            </span>
                          )}

                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            <span className="text-xs font-semibold text-slate-700">
                              Unit Price: <strong className="text-slate-900">{formatCurrency(item.unit_price)}</strong>
                            </span>

                            {/* Stock Availability Badge */}
                            {isLowStock ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                <span>Low Stock ({product.stock_quantity} left)</span>
                              </span>
                            ) : isStockAvailable ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                <span>In Stock</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <span>Out of Stock</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity Stepper, Line Subtotal, and Remove Button */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* 44px+ Accessible Quantity Stepper */}
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                          <button
                            type="button"
                            disabled={item.quantity <= 1 || updateItem.isPending}
                            onClick={() =>
                              updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                            }
                            aria-label={`Decrease quantity for ${productName}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>

                          <span className="w-9 text-center text-xs font-bold text-slate-900 select-none">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={updateItem.isPending}
                            onClick={() =>
                              updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })
                            }
                            aria-label={`Increase quantity for ${productName}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>

                        {/* Line Subtotal */}
                        <div className="text-right min-w-[90px]">
                          <span className="text-base sm:text-lg font-black text-slate-900 block">
                            {formatCurrency(itemSubtotal)}
                          </span>
                        </div>

                        {/* Remove Item Button */}
                        <button
                          type="button"
                          onClick={() => setItemToRemove(item)}
                          disabled={removeItem.isPending}
                          aria-label={`Remove ${productName} from shopping bag`}
                          className="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code / Coupon Section */}
              <div className="rounded-[20px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Have a promo code?
                </h2>

                {cart?.coupon_code ? (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                      <Tag className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                      <span>Active Coupon: {cart.coupon_code}</span>
                      {cart.discount_total ? (
                        <span className="text-emerald-700">(-{formatCurrency(cart.discount_total)})</span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      disabled={removeCoupon.isPending}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Enter promo code..."
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError(null);
                        }}
                        aria-label="Promo code input"
                        className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
                      />
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                    </div>
                    <button
                      type="submit"
                      disabled={!couponCode.trim() || applyCoupon.isPending}
                      className="h-11 px-5 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
                    >
                      {applyCoupon.isPending ? "Applying..." : "Apply"}
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-xs text-rose-600 font-medium">{couponError}</p>
                )}
              </div>

              {/* Continue Shopping Link */}
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: STICKY ORDER SUMMARY (4 cols on desktop)              */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
              <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 shadow-2xs space-y-5">
                <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3.5">
                  Order Summary
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Hardware Subtotal</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(cart?.subtotal ?? 0)}
                    </span>
                  </div>

                  {cart?.discount_total ? (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promotional Discount</span>
                      <span>-{formatCurrency(cart.discount_total)}</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Shipping</span>
                    <span className="text-slate-500">
                      {cart?.shipping_total ? formatCurrency(cart.shipping_total) : "Calculated at checkout"}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax</span>
                    <span className="text-slate-500">
                      {cart?.tax_total ? formatCurrency(cart.tax_total) : "Calculated at checkout"}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-700">Estimated Total</span>
                    <span className="text-xl font-black text-slate-900">
                      {formatCurrency(cart?.grand_total ?? cart?.subtotal ?? 0)}
                    </span>
                  </div>
                </div>

                {/* Primary Checkout CTA */}
                <Link href="/checkout" className="block pt-2">
                  <button
                    type="button"
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:scale-98 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </Link>

                {/* Trust & Security Badges */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                    <span>256-Bit Encrypted Secure Laboratory Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-3.5 w-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                    <span>Express Laboratory &amp; Clinical Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                    <span>30-Day Money-Back Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 4. CONFIRMATION DIALOGS FOR DESTRUCTIVE ACTIONS                         */}
        {/* ======================================================================= */}
        {/* Single Item Removal Confirmation */}
        <ConfirmDialog
          open={Boolean(itemToRemove)}
          onOpenChange={(open) => {
            if (!open) setItemToRemove(null);
          }}
          title="Remove Item?"
          description={`Are you sure you want to remove ${
            itemToRemove?.product?.name || "this item"
          } from your shopping bag?`}
          confirmText="Remove Item"
          cancelText="Cancel"
          variant="danger"
          isLoading={removeItem.isPending}
          onConfirm={handleConfirmRemoveItem}
        />

        {/* Clear Cart Confirmation */}
        <ConfirmDialog
          open={isClearConfirmOpen}
          onOpenChange={setIsClearConfirmOpen}
          title="Clear Shopping Bag?"
          description="This will remove all items from your shopping bag."
          confirmText="Clear Bag"
          cancelText="Cancel"
          variant="danger"
          isLoading={clearCart.isPending}
          onConfirm={handleConfirmClearCart}
        />
      </Container>
    </div>
  );
}
