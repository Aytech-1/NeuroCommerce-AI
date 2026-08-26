"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  Bell,
  MapPin,
  Star,
  User,
  LogOut,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";
import { useCustomerProfile } from "@/hooks/use-customer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const customerNavGroups: NavGroup[] = [
  {
    group: "ACCOUNT",
    items: [
      { title: "Overview", href: "/account", icon: LayoutDashboard },
      { title: "Profile & Security", href: "/account/profile", icon: User },
    ],
  },
  {
    group: "SHOPPING",
    items: [
      { title: "Orders", href: "/account/orders", icon: ShoppingBag },
      { title: "Wishlist", href: "/account/wishlist", icon: Heart },
      { title: "Addresses", href: "/account/addresses", icon: MapPin },
    ],
  },
  {
    group: "ENGAGEMENT",
    items: [
      { title: "Reviews", href: "/account/reviews", icon: Star },
      { title: "Notifications", href: "/account/notifications", icon: Bell },
    ],
  },
];

interface CustomerSidebarProps {
  onItemClick?: () => void;
}

export function CustomerSidebar({ onItemClick }: CustomerSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: profile } = useCustomerProfile();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const customerName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "Customer";

  const customerEmail = profile?.email || user?.email || "";
  const initials = customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "NC";

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
    <aside className="space-y-6">
      {/* Customer Identity Card */}
      <div className="flex items-center gap-3.5 p-4 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-extrabold text-sm border border-blue-100">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
            {customerName}
          </h3>
          <p className="text-[11px] text-slate-500 truncate">{customerEmail}</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="rounded-[20px] bg-white border border-slate-200/90 p-3 shadow-2xs space-y-4">
        {customerNavGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block">
              {group.group}
            </span>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onItemClick}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-all",
                      isActive
                        ? "bg-blue-50/70 text-blue-600 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                        )}
                      />
                      <span>{item.title}</span>
                    </div>
                    {isActive && (
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sign Out Action */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={isLogoutConfirmOpen}
        onOpenChange={setIsLogoutConfirmOpen}
        title="Sign out of your account?"
        description="You will need to sign in again to access your customer dashboard, orders, and saved addresses."
        confirmText="Sign Out"
        variant="danger"
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
      />
    </aside>
  );
}
