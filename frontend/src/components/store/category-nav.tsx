"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { useCategoriesTree } from "@/hooks/use-storefront";
import { ChevronRight, Sparkles, Layers } from "lucide-react";

export function CategoryNav() {
  const { data: categories } = useCategoriesTree();

  if (!categories || categories.length === 0) return null;

  return (
    <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-2xs">
      <Container className="flex items-center gap-6 overflow-x-auto py-2.5 text-xs font-semibold text-slate-600 no-scrollbar">
        <Link
          href="/products"
          className="flex items-center gap-1.5 whitespace-nowrap font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>All Products</span>
        </Link>

        {categories.slice(0, 8).map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="whitespace-nowrap text-slate-600 hover:text-blue-600 transition-colors"
          >
            {cat.name}
          </Link>
        ))}

        <Link
          href="/categories"
          className="ml-auto flex items-center gap-1 whitespace-nowrap text-slate-500 hover:text-blue-600 font-bold transition-colors"
        >
          <span>All Categories</span>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </Container>
    </div>
  );
}
