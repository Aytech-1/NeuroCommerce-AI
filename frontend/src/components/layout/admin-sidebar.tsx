"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
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
  ChevronLeft,
  X,
  ExternalLink,
  LogOut,
  Sparkles,
  CreditCard,
  Truck,
  RotateCcw,
  Receipt,
  DollarSign,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth-service";
import { Can } from "@/components/ui/can";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const adminNavGroups: NavGroup[] = [
  {
    group: "OVERVIEW",
    items: [
      { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    group: "COMMERCE",
    items: [
      { title: "Products", href: "/admin/products", icon: Package, permission: "product.view" },
      { title: "Categories", href: "/admin/categories", icon: Layers, permission: "category.view" },
      { title: "Brands", href: "/admin/brands", icon: Tag, permission: "brand.view" },
      { title: "Orders", href: "/admin/orders", icon: ShoppingCart, permission: "order.view" },
      { title: "Invoices", href: "/admin/invoices", icon: Receipt, permission: "order.view" },
      { title: "Payments", href: "/admin/payments", icon: CreditCard, permission: "payment.view" },
      { title: "Finance & Accounting", href: "/admin/finance", icon: DollarSign, permission: "report.view" },
      { title: "Shipments", href: "/admin/shipments", icon: Truck, permission: "shipping.view" },
      { title: "Returns & Refunds", href: "/admin/returns", icon: RotateCcw, permission: "payment.view" },
      { title: "Customers", href: "/admin/customers", icon: Users, permission: "customer.view" },
    ],
  },
  {
    group: "MARKETING",
    items: [
      { title: "Coupons", href: "/admin/coupons", icon: Tag, permission: "coupon.view" },
      { title: "Reviews", href: "/admin/reviews", icon: MessageSquare, permission: "review.view" },
    ],
  },
  {
    group: "CONTENT & MEDIA",
    items: [
      { title: "CMS Pages", href: "/admin/cms/pages", icon: FileText, permission: "cms.view" },
      { title: "Media Library", href: "/admin/media", icon: ImageIcon, permission: "media.view" },
    ],
  },
  {
    group: "GOVERNANCE",
    items: [
      { title: "Staff", href: "/admin/staff", icon: Shield, permission: "staff.view" },
      { title: "Roles & RBAC", href: "/admin/roles", icon: ShieldCheck, permission: "role.view" },
      { title: "Notifications", href: "/admin/notifications", icon: Bell, permission: "notification.view" },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert, permission: "audit.view" },
      { title: "Activity Logs", href: "/admin/activity-logs", icon: Activity, permission: "audit.view" },
    ],
  },
  {
    group: "CONFIGURATION",
    items: [
      { title: "Settings", href: "/admin/settings", icon: Settings, permission: "settings.view" },
      { title: "Feature Flags", href: "/admin/feature-flags", icon: Sliders, permission: "settings.view" },
      { title: "System Health", href: "/admin/system-health", icon: Activity, permission: "settings.view" },
    ],
  },
];

interface AdminSidebarProps {
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ isMobile = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const adminName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "Administrator";

  const adminRole = user?.role || "Staff";
  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // client cleanup
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
      logout();
      toast.success("Signed out successfully");
      router.push("/login");
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-white border-r border-slate-200/90 transition-all duration-300 z-30",
        isMobile ? "h-full w-72" : sidebarCollapsed ? "w-20" : "w-[260px]",
        !isMobile && "hidden lg:flex"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/80">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2.5 overflow-hidden truncate"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-xs shrink-0 shadow-2xs">
            NC
          </div>
          {(!sidebarCollapsed || isMobile) && (
            <div className="min-w-0">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight block truncate">
                NeuroCommerce
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block truncate">
                Enterprise Admin
              </span>
            </div>
          )}
        </Link>

        {isMobile ? (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Close mobile menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {adminNavGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            {(!sidebarCollapsed || isMobile) && (
              <h4 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {group.group}
              </h4>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(`${item.href}`));

                return (
                  <Can key={item.href} permission={item.permission}>
                    <Link
                      href={item.href}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all group",
                        isActive
                          ? "bg-blue-50/80 text-blue-600 shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                      title={sidebarCollapsed && !isMobile ? item.title : undefined}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                        )}
                      />
                      {(!sidebarCollapsed || isMobile) && (
                        <span className="truncate flex-1">{item.title}</span>
                      )}
                      {isActive && (!sidebarCollapsed || isMobile) && (
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                      )}
                    </Link>
                  </Can>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Administrator & Quick Actions */}
      <div className="p-3 border-t border-slate-200/80 space-y-2">
        {(!sidebarCollapsed || isMobile) && (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-extrabold text-xs">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-extrabold text-slate-900 truncate block">
                {adminName}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">
                {adminRole}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-0.5">
          <Link
            href="/"
            target="_blank"
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors",
              sidebarCollapsed && !isMobile && "justify-center"
            )}
            title="View Storefront"
          >
            <ExternalLink className="h-4 w-4 text-slate-400 shrink-0" />
            {(!sidebarCollapsed || isMobile) && <span>View Storefront</span>}
          </Link>

          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left",
              sidebarCollapsed && !isMobile && "justify-center"
            )}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {(!sidebarCollapsed || isMobile) && <span>Sign Out</span>}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={isLogoutConfirmOpen}
        onOpenChange={setIsLogoutConfirmOpen}
        title="Sign out of your account?"
        description="You will need to sign in again to access the administrative workspace."
        confirmText="Sign Out"
        variant="danger"
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
      />
    </aside>
  );
}
