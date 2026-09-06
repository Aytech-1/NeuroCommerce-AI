"use client";

import Link from "next/link";
import { ShieldCheck, BadgeCheck, Truck, Headphones, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export function StoreFooter() {
  return (
    <footer className="border-t border-slate-800 bg-[#0F172A] text-white">
      {/* ========================================================================= */}
      {/* TOP / MAIN FOOTER NAVIGATION (4 COLUMNS ON DESKTOP, 2 TABLET, 1 MOBILE)   */}
      {/* ========================================================================= */}
      <div className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* ------------------------------------------------------------------- */}
            {/* COLUMN 1: BRAND IDENTITY (~36% width on desktop)                    */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-4 space-y-5">
              {/* Brand Logo */}
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white font-extrabold text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  N
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white leading-none">
                    Neuro<span className="text-blue-500">Commerce</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                    Advanced BCI &amp; Neural Tech
                  </span>
                </div>
              </Link>

              {/* Tagline & Description */}
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                Discover advanced technology, intelligent devices, and research equipment designed
                for the next generation of discovery.
              </p>

              {/* Platform Status Indicator */}
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Technology Platform Online</span>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* COLUMN 2: SHOP NAVIGATION (~20% width on desktop)                   */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Shop
              </h3>
              <nav aria-label="Shop Navigation">
                <ul className="space-y-2.5 text-sm font-medium">
                  <li>
                    <Link
                      href="/"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/categories"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Shop by Category
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/brands"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Trusted Brands
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Special Offers &amp; Deals
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* COLUMN 3: CUSTOMER SUPPORT (~20% width on desktop)                  */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Customer Support
              </h3>
              <nav aria-label="Customer Support Navigation">
                <ul className="space-y-2.5 text-sm font-medium">
                  <li>
                    <Link
                      href="/account"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Customer Account
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account/orders"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Track Order
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account/wishlist"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      My Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cart"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Shopping Cart
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account/addresses"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Saved Addresses
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* COLUMN 4: RESOURCES / COMPANY (~24% width on desktop)               */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Resources
              </h3>
              <nav aria-label="Resources Navigation">
                <ul className="space-y-2.5 text-sm font-medium">
                  <li>
                    <Link
                      href="/products"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Technology Insights
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/categories"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Hardware Catalog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account/profile"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Account Security
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/account/notifications"
                      className="text-slate-300 hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
                    >
                      Help &amp; Notifications
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </Container>
      </div>

      {/* ========================================================================= */}
      {/* SECURITY / REASSURANCE TRUST ROW                                          */}
      {/* ========================================================================= */}
      <div className="border-t border-slate-800/80 bg-slate-900/40 py-6">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" aria-hidden="true" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-2.5">
              <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" aria-hidden="true" />
              <span>Verified Products</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-blue-500 shrink-0" aria-hidden="true" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Headphones className="h-4 w-4 text-blue-500 shrink-0" aria-hidden="true" />
              <span>24/7 Expert Support</span>
            </div>
          </div>
        </Container>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM LEGAL BAR & COPYRIGHT                                              */}
      {/* ========================================================================= */}
      <div className="border-t border-slate-800/80 py-6 text-xs text-slate-400">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 NeuroCommerce. All rights reserved.</p>

            <nav aria-label="Legal Navigation" className="flex items-center gap-6 font-medium">
              <Link
                href="/privacy"
                className="hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              >
                Privacy Notice
              </Link>
              <Link
                href="/terms"
                className="hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="/security"
                className="hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
              >
                Security Policy
              </Link>
            </nav>
          </div>
        </Container>
      </div>
    </footer>
  );
}
