"use client";

import React from "react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useUIStore } from "@/stores/ui-store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-[#F8FAFC]">
        {/* Desktop Sidebar */}
        <AdminSidebar />

        {/* Mobile Drawer Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 animate-in slide-in-from-left duration-300">
              <AdminSidebar isMobile />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminTopbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
