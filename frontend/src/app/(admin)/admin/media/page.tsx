"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  Search,
  Trash2,
  File,
  Image as ImageIcon,
  Check,
  ChevronRight,
  Filter,
  AlertCircle,
  LayoutGrid,
  List,
  Copy,
  CheckCheck,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";
import { useMedia, useUploadMedia, useDeleteMedia } from "@/hooks/use-media";
import { formatBytes, formatDate } from "@/lib/utils";
import { MediaFileItem } from "@/services/media-service";
import { toast } from "sonner";

export default function AdminMediaPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [inspectItem, setInspectItem] = useState<MediaFileItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [uploadCollection, setUploadCollection] = useState("general");

  const { data, isLoading, isError, refetch } = useMedia({
    page,
    per_page: 20,
    search: search.trim() || undefined,
    collection: collection || undefined,
  });

  const uploadMutation = useUploadMedia();
  const deleteMutation = useDeleteMedia();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("collection", uploadCollection);
    if (altText.trim()) {
      formData.append("alt_text", altText.trim());
    }

    try {
      await uploadMutation.mutateAsync(formData);
      toast.success("File uploaded successfully!");
      setIsUploadOpen(false);
      setSelectedFile(null);
      setAltText("");
    } catch {
      toast.error("Failed to upload file.");
    }
  };

  const [mediaToDelete, setMediaToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = (id: string, name: string) => {
    setMediaToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!mediaToDelete) return;
    try {
      await deleteMutation.mutateAsync(mediaToDelete.id);
      toast.success("Media asset deleted.");
      if (inspectItem?.id === mediaToDelete.id) {
        setInspectItem(null);
      }
      setMediaToDelete(null);
    } catch {
      toast.error("Failed to delete media asset.");
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Asset URL copied to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalAssets = data?.meta?.total ?? data?.data?.length ?? 0;
  const imageCount = data?.data?.filter((m) => m.mime_type.startsWith("image/")).length ?? 0;
  const documentCount = data?.data?.filter((m) => !m.mime_type.startsWith("image/")).length ?? 0;

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
            Media Library
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              MEDIA LIBRARY
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Media Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage the digital assets powering the NeuroCommerce storefront and administration experience.
            </p>
          </div>

          <Button
            onClick={() => setIsUploadOpen(true)}
            className="h-10 px-4 gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-xs"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Upload File</span>
          </Button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. MEDIA KPI SUMMARY ROW                                                */}
      {/* ======================================================================= */}
      {data?.data && data.data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Assets
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalAssets} Assets
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Image Files
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {imageCount} Images
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Documents &amp; PDFs
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {documentCount} Files
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Storage Stream
            </span>
            <span className="text-xs font-extrabold text-emerald-700 mt-2 block">
              Online &amp; Synchronized
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
              placeholder="Search by filename or title..."
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
              value={collection}
              onChange={(e) => {
                setCollection(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Collections</option>
              <option value="general">General</option>
              <option value="products">Products</option>
              <option value="banners">Banners</option>
              <option value="documents">Documents</option>
            </select>

            {/* View Switcher */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-white text-blue-600 shadow-2xs font-bold" : "text-slate-400 hover:text-slate-700"
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-white text-blue-600 shadow-2xs font-bold" : "text-slate-400 hover:text-slate-700"
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {(search || collection) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCollection("");
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
      {/* 4. MEDIA ASSETS GRID / LIST                                             */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <Skeleton key={i} className="h-48 rounded-[20px]" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-rose-200 shadow-2xs text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Failed to load media assets</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to retrieve assets from the storage repository.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Retry Loading
          </Button>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-6">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {data.data.map((item) => {
                const isImage = item.mime_type.startsWith("image/");
                return (
                  <div
                    key={item.id}
                    className="group relative overflow-hidden flex flex-col justify-between rounded-[20px] bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
                    onClick={() => setInspectItem(item)}
                  >
                    {/* Thumbnail */}
                    <div className="h-36 w-full bg-slate-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
                      {isImage ? (
                        <img
                          src={item.url}
                          alt={item.alt_text || item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <File className="h-12 w-12 text-slate-400" />
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="p-3 text-xs space-y-1.5">
                      <p className="font-extrabold text-slate-900 truncate" title={item.file_name}>
                        {item.file_name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                        <span>{formatBytes(item.size)}</span>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {item.collection}
                        </span>
                      </div>
                    </div>

                    {/* Action Hover Controls */}
                    <div
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item.url, item.id)}
                        className="h-7 w-7 flex items-center justify-center bg-white/90 hover:bg-white text-slate-600 hover:text-blue-600 rounded-full shadow-md backdrop-blur-xs transition-colors"
                        aria-label="Copy asset URL"
                      >
                        {copiedId === item.id ? (
                          <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.file_name)}
                        className="h-7 w-7 flex items-center justify-center bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600 rounded-full shadow-md backdrop-blur-xs transition-colors"
                        aria-label="Delete asset"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[20px] bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] bg-slate-50/50">
                      <th className="py-3.5 px-6">Asset</th>
                      <th className="py-3.5 px-4">Collection</th>
                      <th className="py-3.5 px-4">MIME Type</th>
                      <th className="py-3.5 px-4">Size</th>
                      <th className="py-3.5 px-4">Uploaded</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.data.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                              {item.mime_type.startsWith("image/") ? (
                                <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                              ) : (
                                <File className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-extrabold text-slate-900 block truncate">
                                {item.file_name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">
                                {item.name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {item.collection}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{item.mime_type}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{formatBytes(item.size)}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">{formatDate(item.created_at)}</td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInspectItem(item)}
                              className="h-8 px-2.5 gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Inspect</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyUrl(item.url, item.id)}
                              className="h-8 px-2.5 gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                            >
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Copy URL</span>
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.file_name)}
                              className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              aria-label={`Delete asset ${item.file_name}`}
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
            </div>
          )}

          {/* Pagination */}
          {data.meta && (
            <div className="p-4 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
              <Pagination
                currentPage={data.meta.current_page}
                totalPages={data.meta.last_page || Math.ceil(data.meta.total / (data.meta.per_page || 20))}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="No Media Assets Found"
          description="Upload product images, brand banners, or PDF manuals."
          actionLabel="Upload Media"
          onAction={() => setIsUploadOpen(true)}
        />
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="rounded-[20px] bg-white border border-slate-200/90 shadow-xl max-w-md">
          <form onSubmit={handleUpload}>
            <DialogHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <DialogTitle className="text-base font-extrabold text-slate-900">
                  Upload Media Asset
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Supported formats: JPG, PNG, WEBP, SVG, PDF (Max 10MB).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Select File *
                </label>
                <Input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  required
                  className="rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Target Collection
                </label>
                <select
                  value={uploadCollection}
                  onChange={(e) => setUploadCollection(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                >
                  <option value="general">General</option>
                  <option value="products">Products</option>
                  <option value="banners">Banners</option>
                  <option value="documents">Documents</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Alt Text (Accessibility)
                </label>
                <Input
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Neural implant sensor close-up..."
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
                className="h-10 px-4 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={uploadMutation.isPending}
                className="h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Upload Asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Asset Inspection Modal */}
      <Dialog open={!!inspectItem} onOpenChange={(open) => !open && setInspectItem(null)}>
        <DialogContent className="rounded-[20px] bg-white border border-slate-200/90 shadow-xl max-w-lg">
          {inspectItem && (
            <div className="space-y-4">
              <DialogHeader className="border-b border-slate-100 pb-3">
                <DialogTitle className="text-base font-extrabold text-slate-900 truncate">
                  {inspectItem.file_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 font-mono">
                  ID: {inspectItem.id}
                </DialogDescription>
              </DialogHeader>

              {/* Large Preview */}
              <div className="h-56 w-full rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                {inspectItem.mime_type.startsWith("image/") ? (
                  <img
                    src={inspectItem.url}
                    alt={inspectItem.alt_text || inspectItem.name}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <File className="h-16 w-16 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-500">Document Asset</p>
                  </div>
                )}
              </div>

              {/* Metadata Details */}
              <div className="space-y-2 text-xs divide-y divide-slate-100">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500 font-medium">Collection:</span>
                  <span className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {inspectItem.collection}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-medium">MIME Type:</span>
                  <span className="font-mono text-slate-800">{inspectItem.mime_type}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-medium">File Size:</span>
                  <span className="font-extrabold text-slate-900">{formatBytes(inspectItem.size)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-medium">Uploaded Date:</span>
                  <span className="text-slate-700 font-semibold">{formatDate(inspectItem.created_at)}</span>
                </div>
                {inspectItem.alt_text && (
                  <div className="pt-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                      Alt Text
                    </span>
                    <p className="text-slate-700 italic">{inspectItem.alt_text}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDelete(inspectItem.id, inspectItem.file_name)}
                  className="h-10 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Delete Asset
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleCopyUrl(inspectItem.url, inspectItem.id)}
                    className="h-10 px-4 text-xs font-bold rounded-xl gap-1.5"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy URL</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setInspectItem(null)}
                    className="h-10 px-4 text-xs font-bold rounded-xl"
                  >
                    Close
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!mediaToDelete}
        onOpenChange={(open) => {
          if (!open) setMediaToDelete(null);
        }}
        title="Delete this media asset?"
        description={`Are you sure you want to delete asset "${mediaToDelete?.name}"? The digital asset will be permanently removed from storage.`}
        confirmText="Delete Asset"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
