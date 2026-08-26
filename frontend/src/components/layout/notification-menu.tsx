"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  Package,
  Shield,
  Tag,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useNotificationStore } from "@/stores/notification-store";

export function NotificationMenu() {
  const { unreadCount, clearUnread, decrementUnread } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const mockAdminNotifications = [
    {
      id: "notif-1",
      title: "Order Dispatched",
      body: "High-priority neural interface package dispatched with live courier telemetry.",
      type: "order",
      time: "10m ago",
      isUnread: true,
    },
    {
      id: "notif-2",
      title: "Security Ledger Updated",
      body: "Administrator permissions synchronized for catalog management boundary.",
      type: "security",
      time: "1h ago",
      isUnread: true,
    },
    {
      id: "notif-3",
      title: "Inventory Stock Alert",
      body: "Bio-telemetry sensor inventory reached the minimum reserve threshold.",
      type: "inventory",
      time: "3h ago",
      isUnread: false,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Topbar Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
        aria-label="Notifications"
        aria-expanded={isOpen}
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

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={clearUnread}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-72 overflow-y-auto space-y-2">
            {unreadCount === 0 ? (
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
              mockAdminNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border text-xs transition-all space-y-1 ${
                    item.isUnread
                      ? "bg-blue-50/30 border-blue-100"
                      : "bg-slate-50/50 border-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      {item.type === "order" ? (
                        <Package className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                      ) : item.type === "security" ? (
                        <Shield className="h-3.5 w-3.5 text-purple-600" aria-hidden="true" />
                      ) : (
                        <Tag className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                      )}
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.body}</p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
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
        </div>
      )}
    </div>
  );
}
