"use client";

import Link from "next/link";
import { ArrowRight, Building2, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrands } from "@/hooks/use-storefront";
import { BrandItem } from "@/services/catalog-service";

export function TrustedBrands() {
  const { data: brands, isLoading, isError } = useBrands();

  // Helper to extract clean initials from brand name
  const getBrandInitials = (name: string): string => {
    if (!name) return "NC";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <section
      aria-labelledby="trusted-brands-heading"
      className="py-16 sm:py-20 lg:py-24 bg-white border-b border-slate-100 overflow-hidden"
    >
      <Container>
        {/* ======================================================================= */}
        {/* SECTION HEADER                                                          */}
        {/* ======================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 lg:mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
              TRUSTED MANUFACTURERS
            </span>
            <h2
              id="trusted-brands-heading"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              Technology From Brands You Can Trust.
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Explore products from established manufacturers and technology brands available through NeuroCommerce.
            </p>
          </div>

          <Link
            href="/brands"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group shrink-0"
          >
            <span>View All Brands</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ======================================================================= */}
        {/* BRANDS GRID / STATES                                                    */}
        {/* ======================================================================= */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-[20px] border border-slate-200/80 bg-white p-6 sm:p-7 space-y-4 shadow-xs"
              >
                <Skeleton className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State Fallback */
          <div className="p-10 rounded-3xl border border-slate-200 bg-white text-center shadow-xs">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">
              Brand information is temporarily unavailable.
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Please browse our comprehensive catalog to discover hardware by category.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Browse Products</span>
              <span>→</span>
            </Link>
          </div>
        ) : brands && brands.length > 0 ? (
          /* Brands Grid: 4 cols desktop, 2 cols tablet, 1 col mobile */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {brands.map((brand: BrandItem) => {
              const initials = getBrandInitials(brand.name);

              return (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  aria-label={`Explore ${brand.name} products`}
                  className="group flex flex-col justify-between rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  <div>
                    {/* Brand Logo / Monogram Container */}
                    <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#F8FAFC] border border-slate-100 text-blue-600 font-extrabold text-lg tracking-tight mb-5 shrink-0 transition-transform duration-200 group-hover:scale-102">
                      <span className="bg-blue-50 text-blue-600 w-full h-full rounded-2xl flex items-center justify-center">
                        {initials}
                      </span>
                    </div>

                    {/* Brand Name */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-2">
                      {brand.name}
                    </h3>

                    {/* Brand Description */}
                    {brand.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {brand.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Row: Product Count & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                    <span className="text-xs text-slate-500 font-medium">
                      {brand.products_count !== undefined
                        ? `${brand.products_count} ${brand.products_count === 1 ? "Product" : "Products"}`
                        : "Verified Brand"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="p-10 rounded-3xl border border-slate-200 bg-white text-center shadow-xs">
            <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">Brands Coming Soon</h3>
            <p className="text-xs text-slate-500 mt-1">
              Explore our catalog while we continue expanding our manufacturer network.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Browse Catalog</span>
              <span>→</span>
            </Link>
          </div>
        )}

        {/* Mobile View All Link */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            href="/brands"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View All Brands</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
