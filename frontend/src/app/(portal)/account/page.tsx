"use client";

import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  MapPin,
  Bell,
  Star,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Clock,
  ExternalLink,
  ChevronRight,
  User,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCustomerProfile,
  useCustomerOrders,
  useCustomerWishlist,
  useCustomerAddresses,
  useCustomerUnreadCount,
} from "@/hooks/use-customer";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function CustomerDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading: profileLoading } = useCustomerProfile();
  const { data: ordersData, isLoading: ordersLoading } = useCustomerOrders({ per_page: 5 });
  const { data: wishlistData, isLoading: wishlistLoading } = useCustomerWishlist();
  const { data: addresses, isLoading: addressesLoading } = useCustomerAddresses();
  const { data: unreadCount } = useCustomerUnreadCount();

  const recentOrders = ordersData?.data || [];
  const displayName = profile?.first_name || user?.first_name || "Neuroscientist";
  const defaultAddress = addresses?.find((a) => a.is_default) || addresses?.[0];
  const wishlistItems = wishlistData?.items || [];

  return (
    <div className="space-y-8">
      {/* ======================================================================= */}
      {/* 1. WELCOME BANNER                                                       */}
      {/* ======================================================================= */}
      <div className="rounded-[24px] border border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block">
              CUSTOMER PORTAL
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Manage your orders, saved products, delivery addresses, and account preferences.
            </p>
          </div>

          <Link
            href="/account/profile"
            className="self-start sm:self-auto inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white text-xs font-extrabold text-blue-700 shadow-sm hover:bg-blue-50 transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. KPI METRIC SUMMARY CARDS                                             */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Orders */}
        <Link
          href="/account/orders"
          className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all block group"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold text-slate-500 block">Total Orders</span>
            <span className="text-xl font-extrabold text-slate-900 block mt-0.5">
              {ordersLoading ? "..." : ordersData?.meta?.total ?? recentOrders.length}
            </span>
          </div>
        </Link>

        {/* Wishlist */}
        <Link
          href="/account/wishlist"
          className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs hover:border-rose-300 hover:shadow-xs transition-all block group"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Heart className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-rose-600 transition-colors" />
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold text-slate-500 block">Wishlist Items</span>
            <span className="text-xl font-extrabold text-slate-900 block mt-0.5">
              {wishlistLoading ? "..." : wishlistItems.length}
            </span>
          </div>
        </Link>

        {/* Addresses */}
        <Link
          href="/account/addresses"
          className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all block group"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <MapPin className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold text-slate-500 block">Saved Addresses</span>
            <span className="text-xl font-extrabold text-slate-900 block mt-0.5">
              {addressesLoading ? "..." : addresses?.length ?? 0}
            </span>
          </div>
        </Link>

        {/* Unread Alerts */}
        <Link
          href="/account/notifications"
          className="p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all block group"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Bell className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold text-slate-500 block">Unread Alerts</span>
            <span className="text-xl font-extrabold text-slate-900 block mt-0.5">
              {unreadCount ?? 0}
            </span>
          </div>
        </Link>
      </div>

      {/* ======================================================================= */}
      {/* 3. RECENT ORDERS                                                        */}
      {/* ======================================================================= */}
      <div className="rounded-[20px] bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Recent Laboratory Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Track current hardware fulfillment shipments
            </p>
          </div>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {ordersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold text-slate-900">
                      {order.order_number}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        order.status === "paid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : order.status === "shipped"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : order.status === "processing"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {order.status_label || order.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block">
                    Placed on {formatDate(order.created_at)} • {order.item_count ?? 1} item(s)
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {formatCurrency(order.total_amount)}
                  </span>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-[#F8FAFC] border border-slate-100 space-y-3">
            <PackageCheck className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-xs font-bold text-slate-700">No Orders Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When you purchase neural interfaces and EEG headsets, they will appear here with real-time tracking.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Browse Hardware
            </Link>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* 4. WISHLIST & SAVED ADDRESS PREVIEWS                                    */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Wishlist Preview */}
        <div className="rounded-[20px] bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-extrabold text-slate-900">Saved Wishlist</h3>
            </div>
            <Link
              href="/account/wishlist"
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View All ({wishlistItems.length})
            </Link>
          </div>

          {wishlistItems.length > 0 ? (
            <div className="space-y-3">
              {wishlistItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <h4 className="font-bold text-slate-900 truncate">
                      {item.product?.name || "Neural Device"}
                    </h4>
                    <span className="text-slate-500 font-semibold">
                      {formatCurrency(item.product?.base_price || 0)}
                    </span>
                  </div>
                  <Link
                    href={`/products/${item.product?.slug || ""}`}
                    className="text-blue-600 hover:underline font-bold text-[11px] shrink-0"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded-xl bg-slate-50 text-xs text-slate-500">
              Your wishlist is empty. Save items while exploring the catalog.
            </div>
          )}
        </div>

        {/* Default Address Preview */}
        <div className="rounded-[20px] bg-white border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Default Delivery Address</h3>
            </div>
            <Link
              href="/account/addresses"
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Manage
            </Link>
          </div>

          {defaultAddress ? (
            <div className="space-y-1 text-xs text-slate-600">
              <p className="font-bold text-slate-900">
                {defaultAddress.first_name} {defaultAddress.last_name}
              </p>
              {defaultAddress.company && <p className="text-slate-500">{defaultAddress.company}</p>}
              <p>{defaultAddress.address_line_1}</p>
              <p>
                {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postal_code}
              </p>
            </div>
          ) : (
            <div className="p-4 text-center rounded-xl bg-slate-50 text-xs text-slate-500">
              No saved delivery address. Add an address for faster checkout.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
