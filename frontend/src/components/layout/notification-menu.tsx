"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Package,
  Shield,
  Tag,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useNotificationStore } from "@/stores/notification-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCustomerNotifications,
  useCustomerUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-customer";
import { CustomerNotificationItem } from "@/services/customer-service";
import { formatDate } from "@/lib/utils";

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (isNaN(diffSec) || diffSec < 0) return "Just now";
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  } catch {
    return "";
  }
}

export function NotificationMenu() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Poll unread count every 60 seconds
  useCustomerUnreadCount({ enabled: isAuthenticated });

  // Fetch latest 5 notifications when authenticated
  const {
    data: notificationsData,
    isLoading,
    isError,
    refetch,
  } = useCustomerNotifications(
    { per_page: 5 },
    { enabled: isAuthenticated }
  );

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const rawNotifications = notificationsData?.data || [];

  const handleNotificationClick = (item: CustomerNotificationItem) => {
    const isUnread = !item.read_at;
    if (isUnread) {
      markReadMutation.mutate(item.id);
    }
    setIsOpen(false);

    if (item.data?.action_url && typeof item.data.action_url === "string") {
      router.push(item.data.action_url);
    } else if (item.data?.order_id) {
      router.push(`/account/orders/${item.data.order_id}`);
    } else {
      router.push("/account/notifications");
    }
  };

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const getNotificationIcon = (title: string, type?: string) => {
    const t = (title + " " + (type || "")).toLowerCase();
    if (t.includes("order") || t.includes("dispatch") || t.includes("hardware") || t.includes("ship")) {
      return <Package className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />;
    }
    if (t.includes("security") || t.includes("ledger") || t.includes("password") || t.includes("login")) {
      return <Shield className="h-3.5 w-3.5 text-purple-600" aria-hidden="true" />;
    }
    if (t.includes("promo") || t.includes("discount") || t.includes("coupon") || t.includes("deal")) {
      return <Tag className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />;
    }
    if (t.includes("stock") || t.includes("inventory")) {
      return <Tag className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />;
    }
    return <Bell className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />;
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Topbar Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="h-4 w-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-extrabold text-white shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Window */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[20px] border border-slate-200/90 bg-white p-4 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {unreadCount} new
                </span>
              )}
            </div>

            {isAuthenticated && unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="max-h-72 overflow-y-auto space-y-2">
            {!isAuthenticated ? (
              <div className="py-6 text-center space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mx-auto">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900">Sign in for alerts</p>
                  <p className="text-[11px] text-slate-500">
                    Log in to receive real-time laboratory & order updates.
                  </p>
                </div>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            ) : isLoading ? (
              <div className="space-y-2 py-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-24 bg-slate-200 rounded" />
                      <div className="h-2.5 w-12 bg-slate-200 rounded" />
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            ) : isError ? (
              <div className="py-6 text-center space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 mx-auto">
                  <AlertCircle className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold text-slate-900">Unable to load notifications</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <RefreshCw className="h-3 w-3" aria-hidden="true" />
                  <span>Retry</span>
                </button>
              </div>
            ) : rawNotifications.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mx-auto">
                  <Bell className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-slate-900">You're all caught up</p>
                  <p className="text-[11px] text-slate-400">No new notifications</p>
                </div>
              </div>
            ) : (
              rawNotifications.map((item) => {
                const isUnread = !item.read_at;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNotificationClick(item)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all space-y-1 block cursor-pointer ${
                      isUnread
                        ? "bg-blue-50/40 border-blue-100 hover:bg-blue-50/70"
                        : "bg-slate-50/40 border-slate-100 hover:bg-slate-100/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-extrabold text-slate-900 flex items-center gap-1.5 ${isUnread ? "text-blue-950" : "text-slate-800"}`}>
                        {getNotificationIcon(item.title, item.type)}
                        <span className="truncate max-w-[180px]">{item.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                    {item.body && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.body}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {isAuthenticated && (
            <div className="pt-2 border-t border-slate-100 text-center">
              <Link
                href="/account/notifications"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                <span>View all notifications</span>
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
