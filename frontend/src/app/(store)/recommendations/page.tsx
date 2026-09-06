"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  History,
  BrainCircuit,
  ShieldCheck,
  Zap,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/store/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTrendingRecommendations,
  useRecentlyViewedRecommendations,
  useSmartRecommendations,
} from "@/hooks/use-storefront";
import { useAuthStore } from "@/stores/auth-store";

type RecTab = "smart" | "trending" | "history";

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState<RecTab>("smart");
  const { isAuthenticated, user } = useAuthStore();

  const smartQuery = useSmartRecommendations(12);
  const trendingQuery = useTrendingRecommendations(12);
  const historyQuery = useRecentlyViewedRecommendations(12);

  const getActiveQueryData = () => {
    switch (activeTab) {
      case "trending":
        return {
          products: trendingQuery.data || [],
          isLoading: trendingQuery.isLoading,
          isError: trendingQuery.isError,
          refetch: trendingQuery.refetch,
          isPersonalized: false,
        };
      case "history":
        return {
          products: historyQuery.data || [],
          isLoading: historyQuery.isLoading,
          isError: historyQuery.isError,
          refetch: historyQuery.refetch,
          isPersonalized: false,
        };
      case "smart":
      default:
        return {
          products: smartQuery.data?.items || [],
          isLoading: smartQuery.isLoading,
          isError: smartQuery.isError,
          refetch: smartQuery.refetch,
          isPersonalized: smartQuery.data?.isPersonalized || false,
        };
    }
  };

  const { products, isLoading, isError, refetch, isPersonalized } = getActiveQueryData();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* PAGE HEADER & HERO */}
      <div className="relative bg-white border-b border-slate-200/80 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40" aria-hidden="true">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-10 w-72 h-72 bg-indigo-400/10 rounded-full blur-2xl" />
        </div>

        <Container className="relative z-10 py-10 sm:py-14">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">AI Recommendations</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-600 text-xs font-bold mb-4 shadow-2xs">
              <BrainCircuit className="h-4 w-4" />
              <span>Real-Time Neuroscience Merchandising Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              AI-Driven Discovery & Hardware Intelligence
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Discover cutting-edge neural interfaces, EEG headsets, BCI development kits, and neuro-stimulation
              devices ranked by real performance telemetry, velocity metrics, and contextual affinity.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>Authoritative Catalog Data</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span>Real-Time Sales & Demand Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Recommendation Node Active</span>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* MAIN CONTENT & TABS */}
      <Container className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab("smart")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "smart"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isAuthenticated ? "Personalized For You" : "Smart Recommendations"}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("trending")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "trending"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Trending Velocity</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === "history"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <History className="h-4 w-4" />
              <span>Recently Viewed</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>
              {activeTab === "smart" && (
                isPersonalized
                  ? `Curated based on account telemetry for ${user?.first_name || "your profile"}`
                  : "Automated ranking based on catalog popularity and device engagement"
              )}
              {activeTab === "trending" && "Ranked by sales velocity, order frequency, and catalog interest"}
              {activeTab === "history" && "Devices and hardware you recently explored during this session"}
            </span>
          </div>
        </div>

        {/* PRODUCT GRID / STATES */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-slate-200/80 bg-white p-5 space-y-4 shadow-xs"
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
            <div className="p-12 rounded-3xl border border-slate-200 bg-white text-center shadow-xs max-w-lg mx-auto">
              <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">
                Recommendations are temporarily unavailable
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                Our recommendation telemetry service is refreshing. You can continue exploring all devices in our
                main catalog.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <span>Browse All Products</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl border border-slate-200 bg-white text-center shadow-xs max-w-lg mx-auto">
              <Sparkles className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">
                {activeTab === "history"
                  ? "No Recently Viewed Products"
                  : "Discover Neuroscience Hardware"}
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                {activeTab === "history"
                  ? "As you browse products in our catalog, they will appear here for fast reference."
                  : "Explore our comprehensive hardware catalog to build your personalization signals."}
              </p>
              <div className="mt-6">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
