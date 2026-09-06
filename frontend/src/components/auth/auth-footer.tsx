"use client";

import Link from "next/link";
import { Globe } from "lucide-react";

export function AuthFooter() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white font-extrabold text-[10px]">
            N
          </div>
          <span className="font-bold text-slate-700">NeuroCommerce</span>
          <span>© 2026 NeuroCommerce. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-5 text-slate-500 font-medium">
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-blue-600 transition-colors">
            Terms of Service
          </Link>
          <Link href="/cms/pages/support" className="hover:text-blue-600 transition-colors">
            Support
          </Link>
          <div className="flex items-center gap-1 text-slate-600 font-bold border-l border-slate-200 pl-4">
            <Globe className="h-3.5 w-3.5" />
            <span>English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
