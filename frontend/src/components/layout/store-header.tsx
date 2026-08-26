"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Heart,
  Menu,
  X,
  ChevronDown,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Sparkles,
  Flame,
  LayoutGrid,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCart } from "@/hooks/use-cart";
import { useCustomerWishlist } from "@/hooks/use-customer";
import { useCategoriesTree } from "@/hooks/use-storefront";
import { useState, useRef, useEffect } from "react";
import { SearchDialog } from "@/components/store/search-dialog";
import { CartDrawer } from "@/components/store/cart-drawer";
import { formatCurrency } from "@/lib/utils";

export function StoreHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { data: cart } = useCart();
  const { data: wishlist } = useCustomerWishlist();
  const { data: categories } = useCategoriesTree();

  const [mounted, setMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [allCategoriesOpen, setAllCategoriesOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  const categoriesRef = useRef<HTMLDivElement>(null);
  const navDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setAllCategoriesOpen(false);
      }
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target as Node)) {
        setCategoriesDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    let url = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    if (selectedCategory !== "all") {
      url += `&category=${encodeURIComponent(selectedCategory)}`;
    }
    router.push(url);
  };

  const wishlistCount = Array.isArray(wishlist) ? wishlist.length : 0;
  const cartTotal = cart?.grand_total ?? cart?.subtotal ?? 0;

  return (
    <>
      <header role="banner" className="sticky top-0 z-40 bg-white shadow-xs">
        {/* ========================================================================= */}
        {/* LEVEL 1 — TOP UTILITY BAR                                                 */}
        {/* ========================================================================= */}
        <div className="border-b border-slate-100 bg-slate-50/90 text-slate-600 text-xs py-2 hidden lg:block">
          <Container className="flex items-center justify-between">
            {/* Left side benefits */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Truck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>
                  Free shipping on orders over <strong className="text-slate-900">$500</strong>
                </span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <RotateCcw className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>30-Day hassle-free returns</span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>Secure payments 100% protected</span>
              </div>
            </div>

            {/* Right side support & links */}
            <div className="flex items-center gap-5 font-medium">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Headphones className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span>24/7 Expert Support</span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <Link href="/account/orders" className="hover:text-blue-600 transition-colors">
                Track Order
              </Link>
              <Link href="/account" className="hover:text-blue-600 transition-colors">
                Help Center
              </Link>
            </div>
          </Container>
        </div>

        {/* ========================================================================= */}
        {/* LEVEL 2 — MAIN BRAND & SEARCH HEADER                                      */}
        {/* ========================================================================= */}
        <div className="border-b border-slate-100 bg-white py-3.5 lg:py-4">
          <Container className="flex items-center justify-between gap-4 lg:gap-8">
            {/* Brand Logo & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white font-extrabold text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                  N
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900 leading-none">
                    Neuro<span className="text-blue-600">Commerce</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase hidden sm:block mt-0.5">
                    Advanced BCI & Neural Tech
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Center Integrated Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-2">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center w-full rounded-full border border-slate-200 bg-slate-50/80 hover:bg-white focus-within:bg-white focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-xs"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, categories, brands..."
                  className="flex-1 bg-transparent py-2.5 pl-5 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />

                {/* Category Dropdown Pill Inside Search */}
                <div className="relative border-l border-slate-200 pl-2 pr-1 hidden lg:block">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent py-1.5 pr-6 pl-2 text-xs font-semibold text-slate-600 hover:text-slate-900 focus:outline-none cursor-pointer appearance-none"
                  >
                    <option value="all">All Categories</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>

                {/* Blue Search Action Button */}
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors mr-1 shadow-sm shrink-0"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Right Action Icons: Wishlist, Cart, Account */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Search Trigger for Mobile/Tablet modal fallback */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search catalog"
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/account/wishlist"
                className="flex items-center gap-2 p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                aria-label="Wishlist"
              >
                <div className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-xs">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <div className="hidden xl:flex flex-col text-left leading-tight">
                  <span className="text-[11px] text-slate-400 font-medium">Favorite</span>
                  <span className="text-xs font-bold text-slate-800">Wishlist</span>
                </div>
              </Link>

              {/* Shopping Bag Button */}
              <button
                onClick={toggleCart}
                aria-label="Open cart"
                className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                <div className="relative">
                  <ShoppingBag className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-xs">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="hidden xl:flex flex-col text-left leading-tight">
                  <span className="text-[11px] text-slate-400 font-medium">Shopping Bag</span>
                  <span className="text-xs font-bold text-slate-800">
                    {cartTotal > 0 ? formatCurrency(cartTotal) : "Cart"}
                  </span>
                </div>
              </button>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              {/* User Account / Sign In */}
              {mounted && isAuthenticated ? (
                <UserMenu />
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </Container>
        </div>

        {/* ========================================================================= */}
        {/* LEVEL 3 — PRIMARY NAVIGATION BAR                                          */}
        {/* ========================================================================= */}
        <div className="border-b border-slate-200/80 bg-white hidden lg:block">
          <Container className="flex items-center justify-between h-13">
            <div className="flex items-center gap-8">
              {/* Prominent "All Categories" Button with Dropdown Menu */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setAllCategoriesOpen(!allCategoriesOpen)}
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                  aria-expanded={allCategoriesOpen}
                >
                  <Menu className="h-4 w-4" />
                  <span>All Categories</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${allCategoriesOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Floating Categories Mega Dropdown */}
                {allCategoriesOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                      Hardware Categories
                    </div>
                    <div className="space-y-1 mt-1">
                      {categories && categories.length > 0 ? (
                        categories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/category/${cat.slug}`}
                            onClick={() => setAllCategoriesOpen(false)}
                            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                          >
                            <span>{cat.name}</span>
                            {cat.products_count !== undefined && (
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                {cat.products_count}
                              </span>
                            )}
                          </Link>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-xs text-slate-400">Loading categories...</div>
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <Link
                        href="/categories"
                        onClick={() => setAllCategoriesOpen(false)}
                        className="flex items-center justify-center gap-1 text-xs font-bold text-blue-600 hover:underline py-1"
                      >
                        <span>View All Categories</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Main Nav Links */}
              <nav className="flex items-center gap-7 text-sm font-semibold text-slate-700">
                <Link
                  href="/"
                  className={`hover:text-blue-600 transition-colors ${
                    pathname === "/" ? "text-blue-600 font-bold" : ""
                  }`}
                >
                  Home
                </Link>

                <Link
                  href="/products"
                  className={`hover:text-blue-600 transition-colors ${
                    pathname === "/products" ? "text-blue-600 font-bold" : ""
                  }`}
                >
                  Catalog
                </Link>

                {/* Categories with Dropdown */}
                <div className="relative" ref={navDropdownRef}>
                  <button
                    onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors font-semibold"
                  >
                    <span>Categories</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>

                  {categoriesDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in-50">
                      {categories?.slice(0, 6).map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          onClick={() => setCategoriesDropdownOpen(false)}
                          className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <Link
                          href="/categories"
                          onClick={() => setCategoriesDropdownOpen(false)}
                          className="block px-3 py-1.5 text-xs font-bold text-blue-600 hover:underline"
                        >
                          Browse All →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/brands"
                  className={`hover:text-blue-600 transition-colors ${
                    pathname === "/brands" ? "text-blue-600 font-bold" : ""
                  }`}
                >
                  Brands
                </Link>

                {/* Deals with Hot Badge */}
                <Link
                  href="/products"
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  <span>Deals</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-rose-500 text-white shadow-xs">
                    <Flame className="h-2.5 w-2.5" />
                    Hot
                  </span>
                </Link>

                {/* AI Recommendations with New Badge */}
                <Link
                  href="/products"
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors text-slate-800"
                >
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>AI Recommendations</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-blue-600 text-white shadow-xs">
                    New
                  </span>
                </Link>
              </nav>
            </div>

            {/* Right utility info */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>Telemetry Node Active</span>
            </div>
          </Container>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE NAVIGATION DRAWER                                                  */}
        {/* ========================================================================= */}
        {mobileNavOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white p-4 animate-in slide-in-from-top-2 shadow-lg">
            {/* Search Input in Mobile Drawer */}
            <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-800">
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Home</span>
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Hardware Catalog</span>
              </Link>
              <Link
                href="/categories"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between"
              >
                <span>All Categories</span>
              </Link>
              <Link
                href="/brands"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between"
              >
                <span>Brands Directory</span>
              </Link>
              <Link
                href="/account/orders"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-600"
              >
                <span>Track Orders</span>
              </Link>
              <Link
                href="/account/wishlist"
                onClick={() => setMobileNavOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-slate-600"
              >
                <span>My Wishlist ({wishlistCount})</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Global Search Dialog Modal (Accessible on trigger) */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />

      {/* Global Slide-over Cart Drawer */}
      <CartDrawer />
    </>
  );
}
