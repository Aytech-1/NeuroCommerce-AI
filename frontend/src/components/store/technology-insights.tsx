"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPosts } from "@/hooks/use-cms";
import { BlogPostItem } from "@/services/cms-service";

export function TechnologyInsights() {
  const { data: blogResponse, isLoading, isError } = useBlogPosts({
    status: "published",
    per_page: 3,
  });

  const rawArticles = blogResponse?.data ?? [];
  // Ensure we only display published articles
  const articles = rawArticles.filter(
    (a: BlogPostItem) => a.status === "published" || !a.status
  ).slice(0, 3);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  return (
    <section
      aria-labelledby="technology-insights-heading"
      className="py-16 sm:py-20 lg:py-24 bg-[#F8FAFC] border-b border-slate-100 overflow-hidden"
    >
      <Container>
        {/* ======================================================================= */}
        {/* SECTION HEADER                                                          */}
        {/* ======================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 lg:mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 block">
              KNOWLEDGE CENTER
            </span>
            <h2
              id="technology-insights-heading"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900"
            >
              Insights for the Future of Technology.
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Explore research, technology guides, and practical insights to help you make better technology decisions.
            </p>
          </div>

          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group shrink-0"
          >
            <span>View All Insights</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* ======================================================================= */}
        {/* EDITORIAL ARTICLES GRID / STATES                                        */}
        {/* ======================================================================= */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-xs"
              >
                <Skeleton className="aspect-16/9 w-full rounded-t-[20px]" />
                <div className="p-6 sm:p-7 space-y-3.5">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="pt-4 border-t border-slate-100 flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          /* Error State Fallback */
          <div className="p-10 rounded-3xl border border-slate-200 bg-white text-center shadow-xs">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">
              Insights are temporarily unavailable.
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Please explore our product catalog for the latest technology offerings.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Explore Products</span>
              <span>→</span>
            </Link>
          </div>
        ) : articles.length > 0 ? (
          /* Articles Grid: 3 cols desktop, 2 cols tablet, 1 col mobile */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article: BlogPostItem) => {
              const formattedDate = formatDate(article.published_at || article.created_at);

              return (
                <article
                  key={article.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-[20px] border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  {/* Article Cover Image or Fallback */}
                  <div className="relative aspect-16/9 w-full overflow-hidden bg-[#F8FAFC] rounded-t-[20px] flex items-center justify-center">
                    {article.featured_image ? (
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50/60 to-slate-100/60 text-blue-600">
                        <BookOpen className="h-10 w-10 opacity-70" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  {/* Article Body Content */}
                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                    <div>
                      {/* Category Badge */}
                      {article.category && (
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EFF6FF] text-blue-600 mb-3">
                          {article.category}
                        </span>
                      )}

                      {/* Article Title */}
                      <Link
                        href="/products"
                        aria-label={`Read ${article.title}`}
                        className="block group-hover:text-blue-600 transition-colors"
                      >
                        <h3 className="line-clamp-2 text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-2.5">
                          {article.title}
                        </h3>
                      </Link>

                      {/* Article Excerpt */}
                      {(article.excerpt || article.content) && (
                        <p className="line-clamp-2 text-sm text-slate-600 leading-relaxed mb-4">
                          {article.excerpt || (article.content ? article.content.slice(0, 140) + "..." : "")}
                        </p>
                      )}
                    </div>

                    {/* Footer: Published Date & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2 text-xs text-slate-500">
                      {formattedDate && (
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          <span>{formattedDate}</span>
                        </span>
                      )}
                      <Link
                        href="/products"
                        aria-label={`Read ${article.title}`}
                        className="inline-flex items-center gap-1 font-bold text-blue-600 group-hover:translate-x-1 transition-transform ml-auto"
                      >
                        <span>Read Article</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="p-10 rounded-3xl border border-slate-200 bg-white text-center shadow-xs">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900">Knowledge Center Coming Soon</h3>
            <p className="text-xs text-slate-500 mt-1">
              We're preparing practical technology insights and research guides.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>Explore Technology</span>
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
            <span>View All Insights</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
