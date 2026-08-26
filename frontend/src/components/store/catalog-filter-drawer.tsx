"use client";

import { useEffect } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { CategoryItem, BrandItem } from "@/services/catalog-service";

interface CatalogFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  minPrice: number | undefined;
  onMinPriceChange: (value: number | undefined) => void;
  maxPrice: number | undefined;
  onMaxPriceChange: (value: number | undefined) => void;
  inStock: boolean;
  onInStockChange: (value: boolean) => void;
  categories?: CategoryItem[];
  brands?: BrandItem[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  totalResults?: number;
}

export function CatalogFilterDrawer({
  isOpen,
  onClose,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  brand,
  onBrandChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  inStock,
  onInStockChange,
  categories,
  brands,
  hasActiveFilters,
  onClearFilters,
  totalResults,
}: CatalogFilterDrawerProps) {
  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-filter-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs lg:hidden"
    >
      {/* Backdrop Click to Dismiss */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Panel */}
      <div className="relative z-10 flex h-full w-full max-w-xs flex-col bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <h2 id="mobile-filter-drawer-title" className="text-base font-bold text-slate-900">
              Filter Catalog
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Close filter drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters Content */}
        <div className="p-4 flex-1">
          <CatalogFilters
            search={search}
            onSearchChange={onSearchChange}
            category={category}
            onCategoryChange={onCategoryChange}
            brand={brand}
            onBrandChange={onBrandChange}
            minPrice={minPrice}
            onMinPriceChange={onMinPriceChange}
            maxPrice={maxPrice}
            onMaxPriceChange={onMaxPriceChange}
            inStock={inStock}
            onInStockChange={onInStockChange}
            categories={categories}
            brands={brands}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
          />
        </div>

        {/* Footer Apply CTA */}
        <div className="border-t border-slate-100 p-4 sticky bottom-0 bg-white shadow-lg space-y-2">
          <button
            onClick={onClose}
            className="w-full h-12 flex items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:scale-98 transition-all"
          >
            {totalResults !== undefined ? `View ${totalResults} Products` : "Apply Filters"}
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="w-full h-9 flex items-center justify-center text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
