"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, Shield, Lock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        {/* ======================================================================= */}
        {/* 1. PORTAL TOPBAR                                                        */}
        {/* ======================================================================= */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 sm:px-8 backdrop-blur-md">
          <Container className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Mobile Navigation Drawer Trigger */}
              <button
                type="button"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="inline-flex md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Account Navigation"
              >
                {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <Link href="/" className="font-extrabold text-xl text-blue-600 tracking-tight flex items-center gap-2">
                <span>NeuroCommerce</span>
              </Link>
              <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-500 border-l border-slate-200 pl-4">
                <span>Customer Portal</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationMenu />
              <div className="h-4 w-px bg-slate-200" />
              <UserMenu />
            </div>
          </Container>
        </header>

        {/* ======================================================================= */}
        {/* 2. MOBILE NAVIGATION SLIDE-OVER DRAWER                                   */}
        {/* ======================================================================= */}
        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex">
            <div
              className="fixed inset-0"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <div className="relative w-72 max-w-[80vw] bg-[#F8FAFC] p-4 shadow-2xl h-full overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Account Menu
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-200/60"
                  aria-label="Close Account Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="pt-4">
                <CustomerSidebar onItemClick={() => setMobileNavOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 3. MAIN PORTAL WORKSPACE                                                */}
        {/* ======================================================================= */}
        <Container className="flex-1 py-8 lg:py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 items-start">
            {/* Desktop Sidebar (1 Col) */}
            <div className="hidden md:block md:col-span-1 md:sticky md:top-24">
              <CustomerSidebar />
            </div>

            {/* Main Content Workspace (3 Cols) */}
            <main className="md:col-span-3 min-w-0">{children}</main>
          </div>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
