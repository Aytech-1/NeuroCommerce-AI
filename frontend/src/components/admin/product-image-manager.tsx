"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileImage,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  ProductImage,
  ImageReorderItem,
} from "@/services/catalog-service";
import {
  useUploadProductImages,
  useDeleteProductImage,
  useReorderProductImages,
} from "@/hooks/use-catalog";
import { toast } from "sonner";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB matching Laravel UploadProductImagesRequest
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

interface PendingPreview {
  file: File;
  previewUrl: string;
}

interface ProductImageManagerProps {
  productId?: string;
  existingImages?: ProductImage[];
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
  disabled?: boolean;
}

export function ProductImageManager({
  productId,
  existingImages = [],
  pendingFiles = [],
  onPendingFilesChange,
  disabled = false,
}: ProductImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingPreviews, setPendingPreviews] = useState<PendingPreview[]>([]);
  const [deletingImage, setDeletingImage] = useState<ProductImage | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mutations for existing product
  const uploadMutation = useUploadProductImages(productId || "");
  const deleteMutation = useDeleteProductImage(productId || "");
  const reorderMutation = useReorderProductImages(productId || "");

  // Sync and generate object URLs for pending files (Create Mode)
  useEffect(() => {
    if (!productId && pendingFiles) {
      const previews: PendingPreview[] = pendingFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setPendingPreviews(previews);

      return () => {
        previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      };
    }
  }, [productId, pendingFiles]);

  const validateFiles = (files: File[]): File[] => {
    setErrorMessage(null);
    const valid: File[] = [];

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        const error = `File "${file.name}" has an unsupported format. Please upload JPEG, PNG, WebP, or AVIF.`;
        setErrorMessage(error);
        toast.error(error);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        const error = `File "${file.name}" exceeds the 5MB size limit (${(file.size / (1024 * 1024)).toFixed(2)}MB).`;
        setErrorMessage(error);
        toast.error(error);
        continue;
      }

      valid.push(file);
    }

    return valid;
  };

  const handleFilesSelected = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const filesArray = Array.from(selectedFiles);
    const validFiles = validateFiles(filesArray);

    if (validFiles.length === 0) return;

    if (productId) {
      // Edit mode: upload immediately to backend
      const formData = new FormData();
      if (validFiles.length === 1) {
        formData.append("image", validFiles[0]);
      } else {
        validFiles.forEach((file) => {
          formData.append("images[]", file);
        });
      }

      if (existingImages.length === 0) {
        formData.append("is_primary", "1");
      }

      try {
        await uploadMutation.mutateAsync(formData);
        toast.success(
          validFiles.length === 1
            ? `Uploaded "${validFiles[0].name}" successfully.`
            : `Uploaded ${validFiles.length} images successfully.`
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to upload image(s). Please try again.";
        setErrorMessage(message);
        toast.error(message);
      }
    } else {
      // Create mode: add to pending list
      if (onPendingFilesChange) {
        const updated = [...pendingFiles, ...validFiles];
        onPendingFilesChange(updated);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePending = (index: number) => {
    if (onPendingFilesChange) {
      const updated = pendingFiles.filter((_, i) => i !== index);
      onPendingFilesChange(updated);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productId || !deletingImage) return;

    try {
      await deleteMutation.mutateAsync(deletingImage.id);
      toast.success("Product image deleted.");
      setDeletingImage(null);
    } catch {
      toast.error("Failed to delete product image.");
    }
  };

  const handleMove = async (index: number, direction: "left" | "right") => {
    if (!productId || existingImages.length < 2) return;

    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= existingImages.length) return;

    const reordered = [...existingImages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const payload: ImageReorderItem[] = reordered.map((img, idx) => ({
      id: img.id,
      sort_order: idx,
    }));

    try {
      await reorderMutation.mutateAsync(payload);
      toast.success("Image order updated.");
    } catch {
      toast.error("Failed to reorder images.");
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFilesSelected(e.dataTransfer.files);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productId, pendingFiles]
  );

  const isBusy =
    uploadMutation.isPending ||
    deleteMutation.isPending ||
    reorderMutation.isPending ||
    disabled;

  return (
    <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-blue-600" aria-hidden="true" />
            <h2 className="text-base font-extrabold text-slate-900">Product Media &amp; Gallery</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Local hardware photography, sensory diagrams, and packaging images.
          </p>
        </div>

        {productId && (
          <span className="text-[11px] font-bold text-slate-400">
            {existingImages.length} {existingImages.length === 1 ? "image" : "images"} uploaded
          </span>
        )}
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 text-xs font-semibold rounded-xl bg-rose-50 border border-rose-200 text-rose-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-rose-500 hover:text-rose-700"
            aria-label="Dismiss error"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Drag and Drop / Upload Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-200 text-center ${
          isDragOver
            ? "border-blue-500 bg-blue-50/50"
            : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
        } ${isBusy ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          disabled={isBusy}
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-2xs text-blue-600 mb-3">
          {uploadMutation.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          ) : (
            <Upload className="h-6 w-6" aria-hidden="true" />
          )}
        </div>

        <h3 className="text-xs font-extrabold text-slate-900">
          {uploadMutation.isPending ? "Uploading Media..." : "Upload Product Images"}
        </h3>
        <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
          Drag and drop local files here, or click to browse from your computer.
        </p>
        <p className="text-[10px] text-slate-400 mt-1 font-mono">
          Supported: JPG, PNG, WebP, AVIF • Max 5MB per file
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 h-9 px-4 text-xs font-bold rounded-xl bg-white shadow-2xs"
        >
          Select Files
        </Button>
      </div>

      {/* 1. Existing Uploaded Gallery (Edit Mode) */}
      {productId && existingImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Uploaded Gallery ({existingImages.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Use arrows to adjust display order
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {existingImages.map((img, idx) => (
              <div
                key={img.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs transition-all hover:border-blue-300 hover:shadow-md"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={img.url}
                    alt={img.alt_text || `Product media ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Primary Badge */}
                  {(img.is_primary || idx === 0) && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-0.5 text-[9px] font-extrabold text-white shadow-2xs">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      <span>Primary</span>
                    </span>
                  )}

                  {/* Delete Button (Overlay) */}
                  <button
                    type="button"
                    onClick={() => setDeletingImage(img)}
                    disabled={isBusy}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-rose-600 opacity-90 transition-all hover:bg-rose-600 hover:text-white shadow-2xs"
                    aria-label={`Delete image ${idx + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Footer Controls / Reordering */}
                <div className="flex items-center justify-between p-2 bg-slate-50 border-t border-slate-100 text-[10px] font-bold text-slate-500">
                  <span>#{idx + 1}</span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "left")}
                      disabled={idx === 0 || isBusy}
                      className="flex h-6 w-6 items-center justify-center rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Move image left"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, "right")}
                      disabled={idx === existingImages.length - 1 || isBusy}
                      className="flex h-6 w-6 items-center justify-center rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Move image right"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Pending Previews (Create Mode) */}
      {!productId && pendingPreviews.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Selected for Upload ({pendingPreviews.length})
            </span>
            <span className="text-[11px] text-amber-600 font-semibold">
              Images will upload automatically when product is saved
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {pendingPreviews.map((item, idx) => (
              <div
                key={idx}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs"
              >
                <div className="relative aspect-square w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                  />

                  {idx === 0 && (
                    <span className="absolute top-2 left-2 rounded-md bg-blue-600 px-2 py-0.5 text-[9px] font-extrabold text-white shadow-2xs">
                      Primary
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemovePending(idx)}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white shadow-2xs"
                    aria-label={`Remove file ${item.file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 text-[10px]">
                  <p className="truncate font-semibold text-slate-700">{item.file.name}</p>
                  <p className="text-slate-400 font-mono">
                    {(item.file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State when no images exist */}
      {((productId && existingImages.length === 0) ||
        (!productId && pendingPreviews.length === 0)) && (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <FileImage className="h-8 w-8 text-slate-300 mb-1" />
          <p className="text-xs font-semibold text-slate-400">
            No product media attached yet.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deletingImage)}
        onOpenChange={(open) => !open && setDeletingImage(null)}
        title="Delete Product Image"
        description="Are you sure you want to delete this image? This action will permanently remove the file from local storage."
        confirmText="Delete Image"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
