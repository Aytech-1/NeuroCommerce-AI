"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Globe,
  Edit3,
  CheckCircle2,
  FileEdit,
  Calendar,
  User,
  ChevronRight,
  Sparkles,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { useCmsPage, useTogglePublishPage } from "@/hooks/use-cms";
import { toast } from "sonner";

export default function CmsPageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: page, isLoading, isError } = useCmsPage(id);
  const togglePublishMutation = useTogglePublishPage();

  const handleTogglePublish = async () => {
    if (!page) return;
    try {
      await togglePublishMutation.mutateAsync(page.id);
      toast.success(`Page ${page.status === "published" ? "unpublished" : "published"}.`);
    } catch {
      toast.error("Failed to toggle page status.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 rounded-[20px]" />
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Page Not Found</h2>
        <p className="text-xs text-slate-500">The requested CMS document does not exist.</p>
        <Link href="/admin/cms/pages">
          <Button variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Back to Pages
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB & HEADER                                                  */}
      {/* ======================================================================= */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
            Admin Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <Link href="/admin/cms/pages" className="hover:text-blue-600 transition-colors">
            CMS Pages
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold truncate max-w-xs" aria-current="page">
            {page.title}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-sm border border-blue-100 shadow-2xs">
              <FileText className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
                DOCUMENT INSPECTION
              </span>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {page.title}
                </h1>
                {page.status === "published" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Globe className="h-3 w-3" aria-hidden="true" />
                    <span>Published</span>
                  </span>
                ) : page.status === "draft" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    <FileEdit className="h-3 w-3" aria-hidden="true" />
                    <span>Draft</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    <Archive className="h-3 w-3" aria-hidden="true" />
                    <span>{page.status}</span>
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Slug: <span className="font-mono text-slate-700 font-bold">/{page.slug}</span> • Template: {page.template}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/admin/cms/pages">
              <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold shadow-2xs">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </Button>
            </Link>
            <Link href={`/admin/cms/pages/${page.id}/edit`}>
              <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold shadow-2xs">
                <Edit3 className="h-4 w-4" aria-hidden="true" />
                <span>Edit</span>
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleTogglePublish}
              isLoading={togglePublishMutation.isPending}
              className={`h-10 px-4 text-xs font-bold rounded-xl shadow-xs ${
                page.status === "published"
                  ? "bg-slate-800 hover:bg-slate-900 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {page.status === "published" ? "Unpublish Page" : "Publish Page"}
            </Button>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. DETAIL GRID                                                          */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left 2 Cols: Content Body */}
        <div className="space-y-6 md:col-span-2">
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Rendered Document Body</h2>
              </div>
            </div>

            <div className="space-y-4">
              {page.excerpt && (
                <div className="p-4 bg-blue-50/60 border-l-4 border-blue-600 rounded-xl text-xs text-slate-700 italic">
                  {page.excerpt}
                </div>
              )}
              <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                {page.content}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Metadata & SEO */}
        <div className="space-y-6">
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Metadata &amp; Publication</h2>
            </div>

            <div className="space-y-3.5 text-xs divide-y divide-slate-100">
              <div className="flex justify-between pt-1">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> Author:
                </span>
                <span className="font-extrabold text-slate-900">
                  {page.author?.name || "System"}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" /> Published:
                </span>
                <span className="font-semibold text-slate-700">
                  {page.published_at ? formatDate(page.published_at) : "Draft"}
                </span>
              </div>
              <div className="flex justify-between pt-2.5">
                <span className="text-slate-500 font-medium">Last Modified:</span>
                <span className="font-semibold text-slate-700">{formatDate(page.updated_at)}</span>
              </div>
              <div className="pt-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  SEO Meta Title
                </span>
                <p className="text-slate-800 font-semibold">{page.meta_title || "None configured"}</p>
              </div>
              <div className="pt-3">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  SEO Description
                </span>
                <p className="text-slate-600">{page.meta_description || "None configured"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
