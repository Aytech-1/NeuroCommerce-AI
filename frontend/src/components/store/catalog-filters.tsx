"use client";

import { Search, X, Check, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryItem, BrandItem } from "@/services/catalog-service";

interface CatalogFiltersProps {
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
}

export function CatalogFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  brand,
  onBrandChange,
  minPrice,
  onMaxPriceChange,
  maxPrice,
  onMinPriceChange,
  inStock,
  onInStockChange,
  categories = [],
  brands = [],
  hasActiveFilters,
  onClearFilters,
}: CatalogFiltersProps) {
  return (
    <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Refine Search
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-sm"
          >
            <X className="h-3.5 w-3.5" />
            <span>Clear all</span>
          </button>
        )}
      </div>

      {/* Keyword Search */}
      <div className="space-y-2">
        <label
          htmlFor="catalog-keyword-search"
          className="block text-xs font-bold text-slate-800"
        >
          Search Products
        </label>
        <div className="relative">
          <Input
            id="catalog-keyword-search"
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200 focus:bg-white pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
        </div>
      </div>

      {/* Categories Filter */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <label
          htmlFor="catalog-category-select"
          className="block text-xs font-bold text-slate-800"
        >
          Category
        </label>
        <div className="space-y-1">
          <select
            id="catalog-category-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Brands Filter */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <label
          htmlFor="catalog-brand-select"
          className="block text-xs font-bold text-slate-800"
        >
          Brand / Manufacturer
        </label>
        <select
          id="catalog-brand-select"
          value={brand}
          onChange={(e) => onBrandChange(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range ($) */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-800">
          Price Range ($)
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative">
            <Input
              type="number"
              placeholder="Min"
              aria-label="Minimum price in dollars"
              value={minPrice !== undefined ? minPrice : ""}
              onChange={(e) =>
                onMinPriceChange(e.target.value ? Number(e.target.value) : undefined)
              }
              className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200 pl-7"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
          </div>

          <div className="relative">
            <Input
              type="number"
              placeholder="Max"
              aria-label="Maximum price in dollars"
              value={maxPrice !== undefined ? maxPrice : ""}
              onChange={(e) =>
                onMaxPriceChange(e.target.value ? Number(e.target.value) : undefined)
              }
              className="h-10 text-xs rounded-xl bg-slate-50 border-slate-200 pl-7"
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
          </div>
        </div>
      </div>

      {/* Availability / In-Stock Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <label
          htmlFor="catalog-in-stock-checkbox"
          className="flex items-center gap-3 text-xs font-semibold text-slate-800 cursor-pointer select-none group"
        >
          <input
            id="catalog-in-stock-checkbox"
            type="checkbox"
            checked={inStock}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
          />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
            <span>In-Stock Only</span>
          </span>
        </label>
      </div>
    </div>
  );
}
