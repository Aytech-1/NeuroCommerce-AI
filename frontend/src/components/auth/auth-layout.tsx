"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Globe } from "lucide-react";
import { AuthFooter } from "./auth-footer";

interface AuthLayoutProps {
  children: React.ReactNode;
  brandPanel?: React.ReactNode;
  mobileBackHref?: string;
  mobileBackLabel?: string;
}

export function AuthLayout({
  children,
  brandPanel,
  mobileBackHref = "/",
  mobileBackLabel = "Back",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white">
      {/* Mobile Top Header */}
      <header className="lg:hidden w-full bg-white border-b border-slate-200/80 px-4 py-3.5 flex items-center justify-between">
        <Link
          href={mobileBackHref}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{mobileBackLabel}</span>
        </Link>

        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-extrabold text-sm">
            N
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900">
            Neuro<span className="text-blue-600">Commerce</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
          <Globe className="h-3.5 w-3.5" />
          <span>EN</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl rounded-[24px] bg-white border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          {brandPanel && (
            <div className="hidden lg:block lg:col-span-5 bg-gradient-to-b from-slate-50 to-white">
              {brandPanel}
            </div>
          )}
          <div className={brandPanel ? "lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 lg:p-12" : "col-span-12 flex flex-col justify-center p-6 sm:p-10 lg:p-12 max-w-xl mx-auto w-full"}>
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Authentication Footer */}
      <AuthFooter />
    </div>
  );
}
