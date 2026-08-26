"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Package,
  CheckCircle2,
  Clock,
  Archive,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Can } from "@/components/ui/can";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useProducts, useCategories, useDeleteProduct, useUpdateProductStatus } from "@/hooks/use-catalog";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading, isError, refetch } = useProducts({
    page,
    per_page: 15,
    search: search.trim() || undefined,
    status: status || undefined,
    category_id: categoryId || undefined,
  });

  const categoriesQuery = useCategories();
  const deleteMutation = useDeleteProduct();
  const updateStatusMutation = useUpdateProductStatus();

  const handleDelete = (id: string, name: string) => {
    setProductToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const { id, name } = productToDelete;
    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`Product "${name}" deleted successfully.`);
      setProductToDelete(null);
    } catch {
      toast.error("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "draft" | "active" | "archived") => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
      toast.success("Product status updated.");
    } catch {
      toast.error("Failed to update product status.");
    }
  };

  const getStatusBadge = (prodStatus: string) => {
    switch (prodStatus) {
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
      case "archived":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Archive className="h-3 w-3" aria-hidden="true" />
            <span>Archived</span>
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {prodStatus}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB & PAGE HEADER                                             */}
      {/* ======================================================================= */}
      <div className="space-y-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
            Admin Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Products
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              Product Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Products
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage product definitions, SKUs, pricing, variants, and visibility.
            </p>
          </div>

          <Can permission="product.create">
            <Link href="/admin/products/create">
              <Button className="h-10 px-4 gap-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold shadow-xs">
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Add Product</span>
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. CATALOG SUMMARY KPI BAR (When Available)                            */}
      {/* ======================================================================= */}
      {data?.meta && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total SKUs
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {data.meta.total}
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Page
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {data.meta.current_page} of {data.meta.last_page || 1}
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Per Page
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {data.meta.per_page || 15}
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Catalog Status
            </span>
            <span className="text-xs font-extrabold text-emerald-700 mt-2 block">
              Synchronized
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
              placeholder="Search by name, SKU, or slug..."
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

            {/* Status filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            {/* Category filter */}
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Categories</option>
              {categoriesQuery.data?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {(search || status || categoryId) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setCategoryId("");
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
      {/* 4. PRODUCT TABLE / CONTENT AREA                                         */}
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
          <h3 className="text-base font-extrabold text-slate-900">Failed to load catalog products</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to communicate with the catalog backend service.
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
                  <th className="py-3.5 px-6">Product</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Updated</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden">
                          {product.primary_image?.url ? (
                            <img
                              src={product.primary_image.url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-slate-400" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-extrabold text-xs text-slate-900 hover:text-blue-600 truncate block transition-colors"
                          >
                            {product.name}
                          </Link>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {product.brand?.name || "Neural Hardware"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-600">
                      {product.sku}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-xs text-slate-900">
                      {formatCurrency(product.base_price)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 font-medium">
                      {formatDate(product.updated_at)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          aria-label="View product"
                        >
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        </Link>
                        <Can permission="product.update">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            aria-label="Edit product"
                          >
                            <Edit className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Can>
                        <Can permission="product.delete">
                          <button
                            type="button"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                            aria-label="Delete product"
                            disabled={deletingId === product.id}
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </Can>
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
          icon={Package}
          title="No Products Found"
          description={
            search || status || categoryId
              ? "No products matched the selected filters. Try broadening your criteria."
              : "Your catalog is empty. Create your first product to begin selling."
          }
          actionLabel="Create Product"
          onAction={() => {
            window.location.href = "/admin/products/create";
          }}
        />
      )}

      <ConfirmDialog
        open={!!productToDelete}
        onOpenChange={(open) => {
          if (!open) setProductToDelete(null);
        }}
        title="Delete this product?"
        description={`Are you sure you want to delete "${productToDelete?.name}"? This product will be archived/soft-deleted from the catalog.`}
        confirmText="Delete Product"
        variant="danger"
        isLoading={deleteMutation.isPending || !!deletingId}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
