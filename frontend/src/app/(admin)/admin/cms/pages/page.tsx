"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  Globe,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  FileEdit,
  ChevronRight,
  Filter,
  AlertCircle,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Can } from "@/components/ui/can";
import { formatDate } from "@/lib/utils";
import { useCmsPages, useTogglePublishPage, useDeleteCmsPage } from "@/hooks/use-cms";
import { toast } from "sonner";

export default function AdminCmsPagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [pageToDelete, setPageToDelete] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading, isError, refetch } = useCmsPages({
    page,
    per_page: 15,
    search: search.trim() || undefined,
    status: status || undefined,
  });

  const togglePublishMutation = useTogglePublishPage();
  const deleteMutation = useDeleteCmsPage();

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    try {
      await togglePublishMutation.mutateAsync(id);
      toast.success(`Page ${currentStatus === "published" ? "unpublished" : "published"} successfully.`);
    } catch {
      toast.error("Failed to update page status.");
    }
  };

  const handleDelete = (id: string, title: string) => {
    setPageToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!pageToDelete) return;
    try {
      await deleteMutation.mutateAsync(pageToDelete.id);
      toast.success("Page deleted successfully.");
      setPageToDelete(null);
    } catch {
      toast.error("Failed to delete page.");
    }
  };

  const totalPages = data?.meta?.total ?? data?.data?.length ?? 0;
  const publishedCount = data?.data?.filter((p) => p.status === "published").length ?? 0;
  const draftCount = data?.data?.filter((p) => p.status === "draft").length ?? 0;
  const archivedCount = data?.data?.filter((p) => p.status === "archived").length ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB & HEADER                                                  */}
      {/* ======================================================================= */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
            Admin Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            CMS
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              CONTENT MANAGEMENT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Content Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage the pages and content that power the NeuroCommerce storefront.
            </p>
          </div>

          <Can permission="page.create">
            <Link href="/admin/cms/pages/create">
              <Button className="h-10 px-4 gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-xs">
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Create Page</span>
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. CMS KPI SUMMARY ROW                                                  */}
      {/* ======================================================================= */}
      {data?.data && data.data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Pages
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalPages} Pages
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Published &amp; Live
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {publishedCount} Published
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Draft Documents
            </span>
            <span className="text-xl font-extrabold text-amber-600 mt-1 block">
              {draftCount} Drafts
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Archived Content
            </span>
            <span className="text-xl font-extrabold text-slate-600 mt-1 block">
              {archivedCount} Archived
            </span>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. FILTER TOOLBAR                                                       */}
      {/* ======================================================================= */}
      <div className="p-4 sm:p-5 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by title or slug..."
              prefixIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
              <Filter className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Filters:</span>
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            {(search || status) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPage(1);
                }}
                className="h-10 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4. CMS PAGES TABLE                                                      */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-rose-200 shadow-2xs text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Failed to load CMS pages</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to communicate with the content management service.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Retry Loading
          </Button>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="rounded-[20px] bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="py-3.5 px-6">Page Title</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Published Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((pageItem) => (
                  <tr key={pageItem.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold border border-blue-100 shadow-2xs">
                          <FileText className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/cms/pages/${pageItem.id}`}
                            className="font-extrabold text-xs text-slate-900 hover:text-blue-600 block truncate"
                          >
                            {pageItem.title}
                          </Link>
                          <span className="text-[10px] text-slate-400 font-medium block truncate mt-0.5">
                            Template: {pageItem.template}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-600 font-semibold">
                      /{pageItem.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      {pageItem.status === "published" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold capitalize px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Globe className="h-3 w-3" aria-hidden="true" />
                          <span>{pageItem.status}</span>
                        </span>
                      ) : pageItem.status === "draft" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold capitalize px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <FileEdit className="h-3 w-3" aria-hidden="true" />
                          <span>{pageItem.status}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold capitalize px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          <Archive className="h-3 w-3" aria-hidden="true" />
                          <span>{pageItem.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-semibold">
                      {pageItem.author?.name || "System"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                      {pageItem.published_at ? formatDate(pageItem.published_at) : "Unpublished"}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/cms/pages/${pageItem.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>View</span>
                          </Button>
                        </Link>
                        <Link href={`/admin/cms/pages/${pageItem.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Edit</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(pageItem.id, pageItem.status)}
                          className="h-8 px-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg"
                        >
                          {pageItem.status === "published" ? "Unpublish" : "Publish"}
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDelete(pageItem.id, pageItem.title)}
                          className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          aria-label={`Delete page ${pageItem.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {data.meta && (
            <div className="p-4 border-t border-slate-100 bg-slate-50/30">
              <Pagination
                currentPage={data.meta.current_page}
                totalPages={data.meta.last_page || Math.ceil(data.meta.total / (data.meta.per_page || 15))}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No CMS Pages Created"
          description="Create your first content page for legal terms, privacy policies, or landing information."
          actionLabel="Create Page"
          onAction={() => {
            window.location.href = "/admin/cms/pages/create";
          }}
        />
      )}

      <ConfirmDialog
        open={!!pageToDelete}
        onOpenChange={(open) => {
          if (!open) setPageToDelete(null);
        }}
        title="Delete this CMS page?"
        description={`Are you sure you want to delete page "${pageToDelete?.title}"? The content page and its public route will be permanently removed.`}
        confirmText="Delete Page"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
