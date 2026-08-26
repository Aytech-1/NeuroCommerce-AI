"use client";

import Link from "next/link";
import {
  BrainCircuit,
  HeartPulse,
  Watch,
  FlaskConical,
  Cable,
  Sparkles,
  ArrowRight,
  Activity,
  Radio,
  Layers,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoriesTree } from "@/hooks/use-storefront";

interface StaticCategoryConfig {
  id: string;
  title: string;
  slug: string;
  description: string;
  defaultCount: string;
  icon: typeof BrainCircuit;
  artworkType: "neural" | "medical" | "wearable" | "laboratory" | "accessories" | "new_arrivals";
}

const FEATURED_CATEGORY_CONFIGS: StaticCategoryConfig[] = [
  {
    id: "cat-neural-hardware",
    title: "Neural Hardware",
    slug: "neural-headsets",
    description: "Advanced neural interfaces and brain-computer technology.",
    defaultCount: "120+ Products",
    icon: BrainCircuit,
    artworkType: "neural",
  },
  {
    id: "cat-medical-devices",
    title: "Medical Devices",
    slug: "clinical-telemetry",
    description: "Clinical-grade devices and equipment for precise outcomes.",
    defaultCount: "85+ Products",
    icon: HeartPulse,
    artworkType: "medical",
  },
  {
    id: "cat-wearables",
    title: "Wearables",
    slug: "wearables",
    description: "Smart wearables for health monitoring and performance tracking.",
    defaultCount: "65+ Products",
    icon: Watch,
    artworkType: "wearable",
  },
  {
    id: "cat-laboratory-equipment",
    title: "Laboratory Equipment",
    slug: "laboratory-equipment",
    description: "High-precision laboratory instruments for research and analysis.",
    defaultCount: "95+ Products",
    icon: FlaskConical,
    artworkType: "laboratory",
  },
  {
    id: "cat-accessories",
    title: "Accessories & Components",
    slug: "accessories",
    description: "Essential accessories and components to power your devices.",
    defaultCount: "200+ Products",
    icon: Cable,
    artworkType: "accessories",
  },
  {
    id: "cat-new-arrivals",
    title: "New Arrivals",
    slug: "new-arrivals",
    description: "Latest innovations and newly added products you'll love.",
    defaultCount: "50+ Products",
    icon: Sparkles,
    artworkType: "new_arrivals",
  },
];

function CategoryArtwork({ type }: { type: StaticCategoryConfig["artworkType"] }) {
  switch (type) {
    case "neural":
      return (
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          {/* Ambient circular backdrop */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-50 via-cyan-50 to-blue-100/60 border border-blue-100/80" />
          
          {/* Headset Arc */}
          <div className="relative z-10 w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-x-2 top-1 h-14 rounded-t-full border-[5px] border-slate-800 bg-transparent" />
            <div className="absolute top-2 inset-x-0 mx-auto w-10 py-0.5 text-center bg-slate-900 text-white rounded text-[5px] font-bold tracking-wider uppercase">
              Neuro
            </div>
            {/* Ear cups */}
            <div className="absolute bottom-3 left-1 w-5 h-8 rounded-lg bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-300 shadow-md flex items-center justify-center transform -rotate-12">
              <div className="w-2 h-4 rounded-sm bg-slate-900" />
            </div>
            <div className="absolute bottom-3 right-1 w-5 h-8 rounded-lg bg-gradient-to-b from-slate-100 to-slate-200 border border-slate-300 shadow-md flex items-center justify-center transform rotate-12">
              <div className="w-2 h-4 rounded-sm bg-slate-900" />
            </div>
            {/* Device Hub */}
            <div className="absolute -bottom-1 inset-x-3 h-7 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-between px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <div className="w-6 h-0.5 bg-blue-500 rounded-full" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            </div>
          </div>
        </div>
      );

    case "medical":
      return (
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-50 via-blue-50 to-indigo-50 border border-blue-100/80" />
          {/* Clinical Telemetry Monitor */}
          <div className="relative z-10 w-22 h-18 rounded-2xl bg-white border-2 border-slate-200 shadow-lg p-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[6px] font-bold text-slate-700">ECG/EEG</span>
              </div>
              <span className="text-[6px] font-mono text-blue-600 font-bold">98%</span>
            </div>
            {/* Graph display */}
            <div className="h-7 bg-slate-950 rounded-lg p-1 flex items-center">
              <svg className="w-full h-full text-cyan-400" viewBox="0 0 80 20" fill="none">
                <path
                  d="M0 10 L 20 10 L 25 3 L 30 17 L 35 10 L 45 10 L 50 5 L 55 15 L 60 10 L 80 10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
            {/* Dials & ports */}
            <div className="flex items-center justify-between px-1">
              <div className="flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
              <div className="w-3 h-1.5 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      );

    case "wearable":
      return (
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-50 via-blue-50 to-slate-100 border border-blue-100/80" />
          {/* Smartwatch */}
          <div className="relative z-10 w-16 h-22 flex flex-col items-center">
            {/* Top Strap */}
            <div className="w-8 h-4 rounded-t-md bg-slate-800" />
            {/* Watch Face */}
            <div className="w-14 h-15 rounded-2xl bg-slate-950 border-2 border-slate-800 shadow-xl p-1.5 flex flex-col justify-between my-0.5">
              <div className="flex items-center justify-between text-[6px] text-slate-400 font-mono">
                <span className="text-white font-bold">EEG</span>
                <span className="text-cyan-400">SYNC</span>
              </div>
              {/* Brain graph */}
              <div className="my-auto text-center">
                <svg className="w-full h-3 text-cyan-400" viewBox="0 0 50 15" fill="none">
                  <path d="M0 8 Q 10 2, 20 8 T 35 3 T 50 8" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="text-[8px] font-black text-white leading-none">80%</span>
              </div>
              <div className="text-[5px] text-slate-400 text-center uppercase tracking-wider">LIVE</div>
            </div>
            {/* Bottom Strap */}
            <div className="w-8 h-4 rounded-b-md bg-slate-800" />
          </div>
        </div>
      );

    case "laboratory":
      return (
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-50 via-blue-50 to-cyan-50 border border-blue-100/80" />
          {/* Microscope Vector */}
          <div className="relative z-10 w-18 h-22 flex flex-col items-center justify-between p-1">
            {/* Eyepiece */}
            <div className="w-4 h-5 rounded-t bg-slate-800 transform -rotate-12" />
            {/* Arm & Objective */}
            <div className="relative w-12 h-10 flex items-center justify-center">
              <div className="w-3 h-8 bg-slate-900 rounded-sm transform rotate-6" />
              <div className="w-4 h-3 bg-cyan-500 rounded-xs absolute right-2 top-4" />
            </div>
            {/* Stage */}
            <div className="w-14 h-2 bg-slate-700 rounded-xs shadow-xs" />
            {/* Base */}
            <div className="w-16 h-3.5 bg-gradient-to-r from-slate-100 via-white to-slate-200 rounded-lg border border-slate-300 shadow-md flex items-center justify-center">
              <div className="w-3 h-1 rounded-full bg-blue-500" />
            </div>
          </div>
        </div>
      );

    case "accessories":
      return (
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-slate-50 via-blue-50 to-cyan-50 border border-blue-100/80" />
          {/* Precision Cables & Sensor Lead */}
          <div className="relative z-10 w-22 h-20 flex flex-col items-center justify-center">
            {/* Cable coil */}
            <div className="w-16 h-10 rounded-full border-4 border-slate-800 bg-transparent shadow-sm flex items-center justify-center transform rotate-12">
              <div className="w-10 h-5 rounded-full border-2 border-slate-600" />
            </div>
            {/* Connector Base & Sensor Pad */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-4 rounded-md bg-white border border-slate-300 shadow-xs flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              </div>
              <div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-slate-400 flex items-center justify-center shadow-xs">
                <div className="w-1 h-1 rounded-full bg-blue-600" />
              </div>
            </div>
          </div>
        </div>
      );

    case "new_arrivals":
      return (
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-50/50 via-blue-50 to-cyan-50 border border-blue-100/80" />
          {/* Presentation Box with Floating Confetti */}
          <div className="relative z-10 w-20 h-20 flex flex-col items-center justify-center">
            {/* Confetti particles */}
            <span className="absolute top-1 left-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
            <span className="absolute top-3 right-2 w-1 h-1 rounded-full bg-cyan-400" />
            <span className="absolute bottom-2 left-1 w-1 h-1 rounded-full bg-amber-400" />
            
            {/* Box Open Lid */}
            <div className="w-16 h-5 bg-slate-100 border border-slate-300 rounded-t-lg transform -rotate-6 shadow-xs" />
            {/* Box Body */}
            <div className="w-18 h-12 bg-white border border-slate-200 rounded-b-xl shadow-lg p-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[6px] font-black text-blue-600 uppercase">Neuro</span>
                <Sparkles className="h-2 w-2 text-amber-500" />
              </div>
              <div className="w-8 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full mx-auto" />
              <div className="text-[5px] font-bold text-slate-400 text-center uppercase tracking-wider">
                New Tech
              </div>
            </div>
          </div>
        </div>
      );
  }
}

export function FeaturedCategories() {
  const { data: apiCategories, isLoading, isError } = useCategoriesTree();

  // If error occurs, render resilient accessible fallback
  if (isError) {
    return (
      <section aria-labelledby="featured-categories-heading" className="py-12 lg:py-16 bg-[#F8FAFC]/60 border-b border-slate-100">
        <Container>
          <div className="p-8 rounded-3xl border border-slate-200 bg-white text-center">
            <h3 className="text-base font-bold text-slate-900">Unable to load categories.</h3>
            <p className="text-xs text-slate-500 mt-1">Please explore our catalog directory directly.</p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Explore All Categories</span>
              <span>→</span>
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  // Map API categories with matching slugs if present, falling back to static config counts
  const categoryCards = FEATURED_CATEGORY_CONFIGS.map((config) => {
    const matched = apiCategories?.find(
      (c) => c.slug === config.slug || c.name.toLowerCase().includes(config.title.toLowerCase())
    );

    return {
      ...config,
      slug: matched?.slug || config.slug,
      productCount:
        matched?.products_count !== undefined
          ? `${matched.products_count}+ Products`
          : config.defaultCount,
    };
  });

  return (
    <section
      aria-labelledby="featured-categories-heading"
      className="py-12 sm:py-16 lg:py-20 bg-[#F8FAFC]/50 border-b border-slate-100"
    >
      <Container>
        {/* ======================================================================= */}
        {/* SECTION HEADER                                                          */}
        {/* ======================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 lg:mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
              EXPLORE OUR COLLECTION
            </span>
            <h2
              id="featured-categories-heading"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              Shop by Category
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Discover advanced technology, research equipment, and intelligent devices built for the next generation.
            </p>
          </div>

          <Link
            href="/categories"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group shrink-0"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ======================================================================= */}
        {/* CATEGORY GRID: 3 cols desktop, 2 cols tablet, 1 col mobile              */}
        {/* ======================================================================= */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[220px] sm:h-[240px] rounded-[20px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {categoryCards.map((category) => {
              const IconComponent = category.icon;

              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group relative bg-white border border-slate-200/90 hover:border-blue-300 rounded-[20px] p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center justify-between gap-4 overflow-hidden min-h-[220px]"
                >
                  {/* Left Content Column */}
                  <div className="flex flex-col justify-between h-full min-w-0 pr-2">
                    <div>
                      {/* Icon Container */}
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {category.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    {/* Count and CTA */}
                    <div className="mt-4 pt-2">
                      <span className="text-xs font-bold text-blue-600 block">
                        {category.productCount}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-blue-600 mt-1 transition-colors">
                        <span>Explore Category</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>

                  {/* Right Device Visual Column */}
                  <CategoryArtwork type={category.artworkType} />
                </Link>
              );
            })}
          </div>
        )}

        {/* Mobile View All Link */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
