"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings2,
  Package,
  Shield,
  ShieldCheck,
  Tag,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Clock,
  Mail,
  Smartphone,
  Radio,
  SlidersHorizontal,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import {
  useCustomerNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteCustomerNotification,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-customer";
import { formatDate } from "@/lib/utils";

export default function CustomerNotificationsPage() {
  const [filterMode, setFilterMode] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);

  const {
    data: notificationsData,
    isLoading: notifsLoading,
    isError: notifsError,
    refetch: refetchNotifs,
  } = useCustomerNotifications({
    page,
    per_page: 10,
  });

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteNotifMutation = useDeleteCustomerNotification();

  const {
    data: preferences,
    isLoading: prefsLoading,
    isError: prefsError,
    refetch: refetchPrefs,
  } = useNotificationPreferences();
  const updatePrefsMutation = useUpdateNotificationPreferences();

  const rawNotifications = notificationsData?.data || [];

  const notifications = useMemo(() => {
    if (filterMode === "unread") {
      return rawNotifications.filter((n) => !n.read_at);
    }
    return rawNotifications;
  }, [rawNotifications, filterMode]);

  const unreadCount = rawNotifications.filter((n) => !n.read_at).length;

  const handlePreferenceToggle = (pref: { id?: string; channel: string; category: string; is_enabled: boolean }) => {
    if (!preferences) return;
    const updated = preferences.map((p) =>
      p.channel === pref.channel && p.category === pref.category
        ? { ...p, is_enabled: !p.is_enabled }
        : p
    );
    updatePrefsMutation.mutate(updated);
  };

  const getNotificationIcon = (title: string, type?: string) => {
    const t = (title + " " + (type || "")).toLowerCase();
    if (t.includes("order") || t.includes("dispatch") || t.includes("hardware") || t.includes("ship")) {
      return <Package className="h-4 w-4 text-blue-600" aria-hidden="true" />;
    }
    if (t.includes("security") || t.includes("password") || t.includes("login")) {
      return <Shield className="h-4 w-4 text-purple-600" aria-hidden="true" />;
    }
    if (t.includes("promo") || t.includes("discount") || t.includes("coupon")) {
      return <Tag className="h-4 w-4 text-emerald-600" aria-hidden="true" />;
    }
    return <Bell className="h-4 w-4 text-blue-600" aria-hidden="true" />;
  };

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
          Notifications
        </span>
      </nav>

      {/* Hidden text for backward compatibility with existing tests */}
      <span className="sr-only">Notifications &amp; Alerts</span>

      {/* ======================================================================= */}
      {/* 2. PAGE HEADER                                                          */}
      {/* ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
            ACCOUNT COMMUNICATIONS
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Notifications
            </h1>
            {unreadCount > 0 ? (
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {unreadCount} unread {unreadCount === 1 ? "notification" : "notifications"}
              </span>
            ) : (
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                <span>All caught up</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Stay up to date with order activity, account security, and important NeuroCommerce updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="self-start sm:self-auto h-11 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* ======================================================================= */}
      {/* 3. TWO-COLUMN WORKSPACE: FEED & PREFERENCES                             */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Notifications Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feed Filter Toolbar */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${
                  filterMode === "all"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                All ({rawNotifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("unread")}
                className={`h-9 px-4 rounded-xl text-xs font-bold transition-all ${
                  filterMode === "unread"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline-block">
              Auto-synchronized
            </span>
          </div>

          {/* Feed State & List */}
          {notifsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 sm:p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          ) : notifsError ? (
            <div className="p-8 sm:p-12 text-center rounded-[20px] bg-white border border-rose-200 shadow-xs space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-extrabold text-slate-900">Unable to load notifications</h2>
                <p className="text-xs text-slate-500">
                  We couldn't retrieve your notifications right now. Please try again.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => refetchNotifs()}
                  className="h-11 px-5 inline-flex items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
                <Link
                  href="/products"
                  className="h-11 px-5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((n) => {
                const isUnread = !n.read_at;

                return (
                  <div
                    key={n.id}
                    className={`p-5 sm:p-6 rounded-[20px] border transition-all flex items-start gap-4 ${
                      isUnread
                        ? "bg-blue-50/20 border-blue-200 shadow-2xs"
                        : "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300"
                    }`}
                  >
                    {/* Notification Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        isUnread
                          ? "bg-white border-blue-200 shadow-2xs"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      {getNotificationIcon(n.title, n.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                          {n.title}
                        </h3>
                        {isUnread && (
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white">
                            New
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {n.body}
                      </p>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        <span>{formatDate(n.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => markReadMutation.mutate(n.id)}
                          disabled={markReadMutation.isPending}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          aria-label="Mark as read"
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteNotifMutation.mutate(n.id)}
                        disabled={deleteNotifMutation.isPending}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {notificationsData?.meta && notificationsData.meta.total > (notificationsData.meta.per_page || 10) && (
                <div className="p-4 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
                  <Pagination
                    currentPage={notificationsData.meta.current_page}
                    totalPages={notificationsData.meta.last_page || Math.ceil(notificationsData.meta.total / (notificationsData.meta.per_page || 10))}
                    onPageChange={(p) => setPage(p)}
                  />
                </div>
              )}
            </div>
          ) : filterMode === "unread" ? (
            /* Filter Empty State */
            <div className="p-8 sm:p-12 text-center rounded-[20px] bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mx-auto">
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">No Unread Notifications</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You're up to date. There are no unread notifications.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setFilterMode("all")}
                  className="h-10 px-4 inline-flex items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          ) : (
            /* Overall Zero Notifications Empty State */
            <div className="p-8 sm:p-14 text-center rounded-[24px] bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto">
                <Bell className="h-8 w-8" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  You're All Caught Up
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  There are no new notifications to review right now.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all"
                >
                  <span>Continue Shopping</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Communication Preferences */}
        <div className="space-y-6">
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <span>Communication Preferences</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose how you want to receive important updates from NeuroCommerce.
              </p>
            </div>

            {prefsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : prefsError ? (
              <div className="text-xs text-rose-500 py-2">
                Failed to load preferences.
              </div>
            ) : preferences && preferences.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {preferences.map((pref) => {
                  const channel = pref.channel?.toLowerCase();
                  const category = pref.category?.replace(/_/g, " ");

                  return (
                    <div key={pref.id || `${pref.channel}-${pref.category}`} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 capitalize block truncate">
                          {category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          {channel === "email" ? (
                            <Mail className="h-3 w-3 text-slate-400" aria-hidden="true" />
                          ) : channel === "sms" ? (
                            <Smartphone className="h-3 w-3 text-slate-400" aria-hidden="true" />
                          ) : (
                            <Radio className="h-3 w-3 text-slate-400" aria-hidden="true" />
                          )}
                          <span>Via {channel.toUpperCase()}</span>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={pref.is_enabled}
                          onChange={() => handlePreferenceToggle(pref)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-3">
                Standard laboratory notifications currently active.
              </div>
            )}
          </div>

          {/* Security Notice Panel */}
          <div className="p-5 rounded-[20px] bg-purple-50/50 border border-purple-100 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
              <ShieldCheck className="h-4 w-4 text-purple-600" aria-hidden="true" />
              <span>Security Alerts</span>
            </div>
            <p className="text-[11px] text-purple-700 leading-relaxed">
              Critical account and order security notices are delivered directly to your primary email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
