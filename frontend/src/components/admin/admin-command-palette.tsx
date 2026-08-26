"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  ShoppingCart,
  Users,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Settings,
  Sliders,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Command,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth-store";

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
}

const STATIC_ADMIN_ROUTES: CommandItem[] = [
  { id: "nav-dashboard", title: "Dashboard & Executive Overview", subtitle: "Real-time analytics and laboratory KPIs", category: "NAVIGATION", href: "/admin/dashboard", icon: LayoutDashboard },
  { id: "nav-products", title: "Products & Catalog", subtitle: "Inventory management and neural interfaces", category: "COMMERCE", href: "/admin/products", icon: Package, permission: "product.view" },
  { id: "nav-categories", title: "Categories & Taxonomies", subtitle: "Catalog taxonomy and classification", category: "COMMERCE", href: "/admin/categories", icon: Layers, permission: "category.view" },
  { id: "nav-brands", title: "Brands & Manufacturers", subtitle: "Hardware vendors and manufacturer profiles", category: "COMMERCE", href: "/admin/brands", icon: Tag, permission: "brand.view" },
  { id: "nav-orders", title: "Orders & Fulfillment", subtitle: "Order fulfillment and financial lifecycle", category: "COMMERCE", href: "/admin/orders", icon: ShoppingCart, permission: "order.view" },
  { id: "nav-customers", title: "Customers & Accounts", subtitle: "Customer 360 directory and accounts", category: "COMMERCE", href: "/admin/customers", icon: Users, permission: "customer.view" },
  { id: "nav-coupons", title: "Coupons & Promotions", subtitle: "Discount rules and promotional codes", category: "MARKETING", href: "/admin/coupons", icon: Tag, permission: "coupon.view" },
  { id: "nav-reviews", title: "Reviews & Feedback", subtitle: "Product feedback and review moderation", category: "MARKETING", href: "/admin/reviews", icon: MessageSquare, permission: "review.view" },
  { id: "nav-cms", title: "CMS & Content Pages", subtitle: "Storefront content, articles, and legal pages", category: "CONTENT", href: "/admin/cms/pages", icon: FileText, permission: "cms.view" },
  { id: "nav-media", title: "Media Library", subtitle: "Digital assets, banners, and product documents", category: "CONTENT", href: "/admin/media", icon: ImageIcon, permission: "media.view" },
  { id: "nav-staff", title: "Staff & Administrators", subtitle: "Administrative team and employee management", category: "GOVERNANCE", href: "/admin/staff", icon: Shield, permission: "staff.view" },
  { id: "nav-roles", title: "Roles & RBAC Matrix", subtitle: "Access control and capability governance", category: "GOVERNANCE", href: "/admin/roles", icon: ShieldCheck, permission: "role.view" },
  { id: "nav-audit", title: "Audit Logs & Ledger", subtitle: "Immutable security mutations and IP trail", category: "GOVERNANCE", href: "/admin/audit-logs", icon: ShieldAlert, permission: "audit.view" },
  { id: "nav-activity", title: "Activity Logs", subtitle: "Staff actions and operational event stream", category: "GOVERNANCE", href: "/admin/activity-logs", icon: Activity, permission: "audit.view" },
  { id: "nav-settings", title: "System Settings", subtitle: "Platform preferences and payment configurations", category: "CONFIGURATION", href: "/admin/settings", icon: Settings, permission: "settings.view" },
  { id: "nav-flags", title: "Feature Flags", subtitle: "Controlled rollouts and experimental features", category: "CONFIGURATION", href: "/admin/feature-flags", icon: Sliders, permission: "settings.view" },
  { id: "nav-health", title: "System Health & Operations", subtitle: "Real-time service availability and platform diagnostics", category: "CONFIGURATION", href: "/admin/system-health", icon: Activity, permission: "settings.view" },
];

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminCommandPalette({ open, onOpenChange }: AdminCommandPaletteProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter routes based on user permissions
  const accessibleRoutes = useMemo(() => {
    return STATIC_ADMIN_ROUTES.filter((item) => {
      if (!item.permission) return true;
      if (!user) return false;
      const role = (user.role || "").toLowerCase();
      if (role === "super_admin" || role === "admin") return true;
      const userPerms = Array.isArray(user.permissions) ? user.permissions : [];
      return userPerms.includes(item.permission);
    });
  }, [user]);

  // Filter items matching query
  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return accessibleRoutes;
    }
    const clean = query.toLowerCase().trim();
    return accessibleRoutes.filter(
      (item) =>
        item.title.toLowerCase().includes(clean) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(clean)) ||
        item.category.toLowerCase().includes(clean)
    );
  }, [accessibleRoutes, query]);

  // Group filtered items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const flatVisibleItems = filteredItems;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      onOpenChange(false);
      router.push(item.href);
    },
    [onOpenChange, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, flatVisibleItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatVisibleItems.length) % Math.max(1, flatVisibleItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatVisibleItems[selectedIndex]) {
        handleSelect(flatVisibleItems[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden rounded-[20px] bg-white shadow-2xl border border-slate-200/90 top-[20%] translate-y-0"
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">Admin Global Search</DialogTitle>
        <DialogDescription className="sr-only">
          Search products, orders, customers, staff, and other available admin resources.
        </DialogDescription>

        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-100 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400 shrink-0 mr-3" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, products, orders, customers, settings..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
            aria-label="Search admin workspace"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded bg-slate-100 px-1.5 font-mono text-[10px] font-bold text-slate-500">
              ESC to close
            </kbd>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-3">
          {flatVisibleItems.length > 0 ? (
            Object.entries(groupedItems).map(([groupName, items]) => (
              <div key={groupName} className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                  {groupName}
                </span>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const currentIndex = flatVisibleItems.findIndex((i) => i.id === item.id);
                    const isSelected = currentIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? "bg-blue-50/80 text-blue-700 font-bold border-l-2 border-blue-600 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                              isSelected
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate text-slate-900">
                              {item.title}
                            </span>
                            {item.subtitle && (
                              <span className="text-[11px] text-slate-400 font-normal block truncate">
                                {item.subtitle}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-mono">
                            {item.category}
                          </span>
                          <ArrowRight
                            className={`h-3.5 w-3.5 transition-transform ${
                              isSelected ? "text-blue-600 translate-x-0.5" : "text-slate-300"
                            }`}
                            aria-hidden="true"
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mx-auto">
                <Search className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="text-xs font-extrabold text-slate-900">No Results Found</h3>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                No administrative workspaces or resources match "{query}".
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/70 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded shadow-2xs text-[10px]">
                ↑
              </kbd>
              <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded shadow-2xs text-[10px]">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="font-mono bg-white border border-slate-200 px-1 py-0.5 rounded shadow-2xs text-[10px]">
                ↵
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span>NeuroCommerce Command Center</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
