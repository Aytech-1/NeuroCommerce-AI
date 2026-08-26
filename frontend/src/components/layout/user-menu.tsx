"use client";

import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, User as UserIcon, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function UserMenu() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted || !isAuthenticated || !user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
      >
        <UserIcon className="h-4 w-4" />
        <span>Sign In</span>
      </Link>
    );
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } catch {
      // client-side cleanup
    } finally {
      setIsLoggingOut(false);
      setIsLogoutConfirmOpen(false);
      logout();
      toast.success("Signed out successfully");
      router.push("/login");
    }
  };

  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "U";
  const isAdminOrStaff =
    user.role === "admin" ||
    user.role === "super_admin" ||
    user.role === "staff" ||
    user.user_type === "admin" ||
    user.user_type === "super_admin" ||
    user.user_type === "staff" ||
    user.roles?.includes("admin") ||
    user.roles?.includes("super_admin") ||
    user.roles?.includes("staff");

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-0.5"
        aria-expanded={isOpen}
        aria-label="User account menu"
      >
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
          {initials}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-[20px] border border-slate-200/90 bg-white p-2 shadow-2xl z-50 animate-in fade-in-50 zoom-in-95">
          <div className="px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-blue-50 text-blue-700 border border-blue-100 capitalize">
              {user.role}
            </span>
          </div>

          <div className="py-1">
            {isAdminOrStaff && (
              <Link
                href="/admin/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Admin Dashboard</span>
              </Link>
            )}
            <Link
              href="/account/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <UserIcon className="h-4 w-4 text-slate-400" />
              <span>My Profile</span>
            </Link>
            <Link
              href="/account/addresses"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-400" />
              <span>Account Settings</span>
            </Link>
          </div>

          <div className="pt-1 border-t border-slate-100">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsLogoutConfirmOpen(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isLogoutConfirmOpen}
        onOpenChange={setIsLogoutConfirmOpen}
        title="Sign out of your account?"
        description="You will need to sign in again to access your account and workspace."
        confirmText="Sign Out"
        variant="danger"
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
      />
    </div>
  );
}
