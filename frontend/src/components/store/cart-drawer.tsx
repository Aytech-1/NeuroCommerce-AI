"use client";

import Link from "next/link";
import { ShoppingBag, X, Trash2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useCart, useUpdateCartItem, useRemoveCartItem } from "@/hooks/use-cart";
import { Skeleton } from "@/components/ui/skeleton";

export function CartDrawer() {
  const { isOpen, closeCart } = useCartStore();
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <DrawerContent className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md sm:max-w-lg flex-col bg-white p-6 shadow-2xl border-l border-slate-200">
        {/* Drawer Header */}
        <DrawerHeader className="flex items-center justify-between border-b border-slate-100 pb-4">
          <DrawerTitle className="flex items-center gap-2.5 text-base font-extrabold text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            </div>
            <span>Shopping Bag ({cart?.items_count ?? items.length})</span>
          </DrawerTitle>
          <DrawerClose asChild>
            <button
              onClick={closeCart}
              aria-label="Close Bag"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        {isLoading ? (
          <div className="flex-1 space-y-4 py-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-3 rounded-2xl bg-slate-50">
                <Skeleton className="h-20 w-20 rounded-xl" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ShoppingBag className="h-8 w-8" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Your shopping bag is empty</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Discover precision technology and research hardware curated for your needs.
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className="inline-flex h-11 items-center justify-center px-6 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-colors mt-2"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                  {/* Thumbnail */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#F8FAFC] border border-slate-200 p-2 flex items-center justify-center">
                    {item.product?.primary_image?.url ? (
                      <img
                        src={item.product.primary_image.url}
                        alt={item.product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <ShoppingBag className="h-6 w-6" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {item.product?.name}
                      </h4>
                      {item.variant && (
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                          Model: {item.variant.sku}
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-900 mt-1 block">
                        {formatCurrency(item.unit_price)}
                      </span>
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between mt-2 pt-1">
                      {/* Quantity Stepper (44px target on touch devices) */}
                      <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
                        <button
                          type="button"
                          disabled={item.quantity <= 1 || updateItem.isPending}
                          onClick={() =>
                            updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                          }
                          aria-label="Decrease quantity"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={updateItem.isPending}
                          onClick={() =>
                            updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })
                          }
                          aria-label="Increase quantity"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Line Total & Remove */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-900">
                          {formatCurrency(item.subtotal || item.unit_price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem.mutate(item.id)}
                          disabled={removeItem.isPending}
                          className="flex h-7 w-7 items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Summary & Actions */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(cart?.subtotal ?? 0)}
                  </span>
                </div>
                {cart?.discount_total ? (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discounts</span>
                    <span>-{formatCurrency(cart.discount_total)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(cart?.grand_total ?? cart?.subtotal ?? 0)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 active:scale-98 transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>

                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full h-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  View Shopping Bag
                </Link>
              </div>

              {/* Security Reassurance */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                <span>256-Bit Encrypted Secure Checkout</span>
              </div>
            </div>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
