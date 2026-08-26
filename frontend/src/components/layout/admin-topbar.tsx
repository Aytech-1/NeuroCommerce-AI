"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Menu, ExternalLink, Activity, ShieldCheck } from "lucide-react";
import { UserMenu } from "./user-menu";
import { NotificationMenu } from "./notification-menu";
import { AdminCommandPalette } from "@/components/admin/admin-command-palette";
import { useUIStore } from "@/stores/ui-store";

export function AdminTopbar() {
  const { setMobileMenuOpen } = useUIStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-8 backdrop-blur-md">
        {/* Left side: Mobile trigger + Global Search Trigger */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Open mobile navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Global Search Bar with Keyboard Shortcut & Command Palette Trigger */}
          <div
            onClick={() => setCommandPaletteOpen(true)}
            className="relative w-full max-w-md hidden sm:block cursor-pointer group"
          >
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              readOnly
              onClick={() => setCommandPaletteOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setCommandPaletteOpen(true);
                }
              }}
              placeholder="Global search (orders, products, customers, SKU)..."
              aria-label="Open global search (Press ⌘K)"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-16 text-xs text-slate-900 placeholder:text-slate-400 group-hover:border-slate-300 group-hover:bg-white focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded bg-slate-200/70 px-1.5 font-mono text-[10px] font-bold text-slate-600">
              <span>⌘</span>K
            </kbd>
          </div>

          {/* Mobile search icon trigger */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="sm:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Open global search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Right side: System Status, Storefront Shortcut, Notifications, Admin Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* System Status Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span>System Operational</span>
          </div>

          {/* Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            title="Open Public Storefront"
          >
            <span>Storefront</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          </Link>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" aria-hidden="true" />

          {/* Notification Bell with Badge */}
          <NotificationMenu />

          <div className="h-4 w-px bg-slate-200" aria-hidden="true" />

          {/* Administrator Profile Menu */}
          <UserMenu />
        </div>
      </header>

      {/* Admin Command Palette Dialog */}
      <AdminCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </>
  );
}
