"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/store/product-card";
import { useFeaturedProducts } from "@/hooks/use-storefront";

export function FeaturedProducts() {
  const { data: products, isLoading, isError } = useFeaturedProducts(8);

  return (
    <section
      aria-labelledby="featured-products-heading"
      className="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-100"
    >
      <Container>
        {/* ======================================================================= */}
        {/* SECTION HEADER                                                          */}
        {/* ======================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 lg:mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
              FEATURED PRODUCTS
            </span>
            <h2
              id="featured-products-heading"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              Explore Featured Technology
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Discover advanced devices and technology selected for performance, reliability, and innovation.
            </p>
          </div>

          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group shrink-0"
          >
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ======================================================================= */}
        {/* PRODUCT GRID / STATES                                                   */}
        {/* ======================================================================= */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-[20px] border border-slate-200/80 bg-white p-5 space-y-4"
              >
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-full ml-4 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State Fallback */
          <div className="p-10 rounded-3xl border border-slate-200 bg-[#F8FAFC] text-center">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">
              Featured products are temporarily unavailable.
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Please browse our comprehensive technology catalog directly.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Browse All Products</span>
              <span>→</span>
            </Link>
          </div>
        ) : products && products.length > 0 ? (
          /* Products Grid: 4 cols desktop, 2 cols tablet, 1-2 cols mobile */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-10 rounded-3xl border border-slate-200 bg-[#F8FAFC] text-center">
            <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">Discover Our Products</h3>
            <p className="text-xs text-slate-500 mt-1">
              Explore the complete NeuroCommerce catalog for advanced neuroscience hardware.
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
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
