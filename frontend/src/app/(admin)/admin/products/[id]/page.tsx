"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Archive,
  ChevronRight,
  Coins,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Can } from "@/components/ui/can";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useProduct, useDeleteProduct } from "@/hooks/use-catalog";
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: product, isLoading, isError } = useProduct(id);
  const deleteMutation = useDeleteProduct();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!product) return;

    try {
      await deleteMutation.mutateAsync(product.id);
      toast.success("Product deleted successfully.");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2 rounded-[20px]" />
          <Skeleton className="h-96 rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto">
          <Package className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The requested catalog item does not exist or has been removed.</p>
        <Link href="/admin/products">
          <Button variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            <span>Active</span>
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" aria-hidden="true" />
            <span>Draft</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Archive className="h-3 w-3" aria-hidden="true" />
            <span>Archived</span>
          </span>
        );
    }
  };

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
          <Link href="/admin/products" className="hover:text-blue-600 transition-colors">
            Products
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            {product.name}
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              CATALOG RECORD
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-mono">
              SKU: {product.sku} • Created {formatDate(product.created_at)}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link href="/admin/products">
              <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold shadow-2xs">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </Button>
            </Link>
            <Can permission="product.update">
              <Link href={`/admin/products/${product.id}/edit`}>
                <Button size="sm" className="h-10 px-4 gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-xs">
                  <Edit className="h-4 w-4" aria-hidden="true" />
                  <span>Edit Product</span>
                </Button>
              </Link>
            </Can>
            <Can permission="product.delete">
              <Button
                variant="destructive"
                size="sm"
                className="h-10 px-4 gap-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Delete</span>
              </Button>
            </Can>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. PRODUCT OVERVIEW & DETAILS GRID                                      */}
      {/* ======================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Left Column (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Gallery / Product Overview */}
          <div className="p-6 sm:p-7 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Product Overview</h2>
              </div>
              {getStatusBadge(product.status)}
            </div>

            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                {product.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <img src={img.url} alt={img.alt_text || product.name} className="h-full w-full object-cover" />
                    {img.is_primary && (
                      <span className="absolute top-2 left-2 rounded-md bg-blue-600 px-2 py-0.5 text-[9px] font-extrabold text-white shadow-2xs">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-36 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs font-semibold text-slate-400">
                No images uploaded for this catalog item
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {product.description || "No full description provided."}
              </p>
            </div>
          </div>

          {/* Variants Table */}
          <div className="rounded-[20px] bg-white border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="text-base font-extrabold text-slate-900">Product Variants</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">SKU variants with specific options and pricing overrides.</p>
            </div>

            {product.variants && product.variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-4">Variant SKU</th>
                      <th className="pb-3 pr-4">Options</th>
                      <th className="pb-3 pr-4">Price</th>
                      <th className="pb-3 pr-4">Stock</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {product.variants.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/60">
                        <td className="py-3 pr-4 font-mono font-bold text-slate-900">{v.sku}</td>
                        <td className="py-3 pr-4 text-slate-600">
                          {v.attributes?.map((av) => `${av.attribute_name || "Option"}: ${av.value}`).join(", ") ||
                           v.attribute_values?.map((av) => `${av.attribute?.name || "Option"}: ${av.value}`).join(", ") ||
                           v.name ||
                           "Default"}
                        </td>
                        <td className="py-3 pr-4 font-extrabold text-slate-900">
                          {v.price ? formatCurrency(v.price) : formatCurrency(product.base_price)}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{v.stock_quantity ?? "Tracked"}</td>
                        <td className="py-3 text-right">
                          <span className={v.is_active ? "text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200" : "text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"}>
                            {v.is_active ? "Active" : "Disabled"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 font-medium">
                Standard single-SKU product. No additional variants defined.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Column (1 Col) */}
        <div className="space-y-6">
          {/* Pricing & Stock Card */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Coins className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Pricing &amp; Commercial</h2>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 font-medium">Base Price:</span>
                <span className="font-extrabold text-base text-slate-900">
                  {formatCurrency(product.base_price, product.currency_code)}
                </span>
              </div>
              {product.compare_at_price && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-500 font-medium">Compare-At Price:</span>
                  <span className="line-through text-slate-400 font-semibold">{formatCurrency(product.compare_at_price, product.currency_code)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 font-medium">Stock Status:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {product.stock_status || "In Stock"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 font-medium">Featured on Home:</span>
                <span className="font-bold text-slate-800">
                  {product.is_featured ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Classification & Metadata Card */}
          <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Tag className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Classification</h2>
            </div>

            <div className="space-y-3 divide-y divide-slate-100 text-xs">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-bold text-slate-900">
                  {product.category?.name || "Uncategorized"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 font-medium">Brand:</span>
                <span className="font-bold text-slate-900">
                  {product.brand?.name || "No Brand"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 font-medium">Last Updated:</span>
                <span className="text-slate-500 font-medium">
                  {formatDate(product.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete this product?"
        description={`Are you sure you want to delete "${product?.name}"? This product will be archived/soft-deleted from the catalog.`}
        confirmText="Delete Product"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
