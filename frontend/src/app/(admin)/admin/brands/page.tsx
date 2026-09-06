"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Tag,
  CheckCircle2,
  XCircle,
  Search,
  ChevronRight,
  ExternalLink,
  RotateCw,
  AlertCircle,
  Building2,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Can } from "@/components/ui/can";
import {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "@/hooks/use-catalog";
import { BrandItem } from "@/services/brand-service";
import { toast } from "sonner";
import { ApiError } from "@/types/api";

export default function AdminBrandsPage() {
  const { data: brands, isLoading, isError, refetch } = useBrands();
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();
  const deleteBrandMutation = useDeleteBrand();

  // Search & Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createWebsiteUrl, setCreateWebsiteUrl] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createSortOrder, setCreateSortOrder] = useState<number>(0);
  const [createIsActive, setCreateIsActive] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editWebsiteUrl, setEditWebsiteUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<BrandItem | null>(null);

  // Status Toggle Loading State
  const [togglingBrandId, setTogglingBrandId] = useState<string | null>(null);

  // ===========================================================================
  // HANDLERS
  // ===========================================================================

  const handleOpenCreate = () => {
    setCreateName("");
    setCreateSlug("");
    setCreateWebsiteUrl("");
    setCreateDescription("");
    setCreateSortOrder(0);
    setCreateIsActive(true);
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      setCreateError("Brand name is required.");
      return;
    }

    setCreateError(null);
    try {
      await createBrandMutation.mutateAsync({
        name: createName.trim(),
        slug: createSlug.trim() || undefined,
        website_url: createWebsiteUrl.trim() || undefined,
        description: createDescription.trim() || undefined,
        sort_order: createSortOrder,
        is_active: createIsActive,
      });

      toast.success("Brand created successfully!");
      setIsCreateOpen(false);
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { data?: { message?: string } } };
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to create brand.";
      setCreateError(message);
      toast.error(message);
    }
  };

  const handleOpenEdit = (brand: BrandItem) => {
    setEditingBrand(brand);
    setEditName(brand.name);
    setEditSlug(brand.slug);
    setEditWebsiteUrl(brand.website_url || "");
    setEditDescription(brand.description || "");
    setEditSortOrder(brand.sort_order ?? 0);
    setEditIsActive(brand.is_active);
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;
    if (!editName.trim()) {
      setEditError("Brand name is required.");
      return;
    }

    setEditError(null);
    try {
      await updateBrandMutation.mutateAsync({
        id: editingBrand.id,
        payload: {
          name: editName.trim(),
          slug: editSlug.trim() || undefined,
          website_url: editWebsiteUrl.trim() || undefined,
          description: editDescription.trim() || undefined,
          sort_order: editSortOrder,
          is_active: editIsActive,
        },
      });

      toast.success("Brand updated successfully!");
      setIsEditOpen(false);
      setEditingBrand(null);
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { data?: { message?: string } } };
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to update brand.";
      setEditError(message);
      toast.error(message);
    }
  };

  const handleToggleStatus = async (brand: BrandItem) => {
    setTogglingBrandId(brand.id);
    try {
      await updateBrandMutation.mutateAsync({
        id: brand.id,
        payload: {
          is_active: !brand.is_active,
        },
      });
      toast.success(
        `Brand "${brand.name}" is now ${!brand.is_active ? "active" : "disabled"}.`
      );
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to toggle brand status."
      );
    } finally {
      setTogglingBrandId(null);
    }
  };

  const handleOpenDelete = (brand: BrandItem) => {
    setDeletingBrand(brand);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingBrand) return;

    try {
      await deleteBrandMutation.mutateAsync(deletingBrand.id);
      toast.success(`Brand "${deletingBrand.name}" deleted successfully.`);
      setIsDeleteOpen(false);
      setDeletingBrand(null);
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { data?: { message?: string } } };
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete brand."
      );
    }
  };

  // ===========================================================================
  // FILTERING & METRICS
  // ===========================================================================

  const filteredBrands = brands?.filter((brand) => {
    const matchesSearch =
      !search ||
      brand.name.toLowerCase().includes(search.toLowerCase()) ||
      brand.slug.toLowerCase().includes(search.toLowerCase()) ||
      (brand.website_url &&
        brand.website_url.toLowerCase().includes(search.toLowerCase())) ||
      (brand.description &&
        brand.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && brand.is_active) ||
      (statusFilter === "disabled" && !brand.is_active);

    return matchesSearch && matchesStatus;
  });

  const totalBrands = brands?.length ?? 0;
  const activeBrands = brands?.filter((b) => b.is_active).length ?? 0;
  const totalProductsAssigned =
    brands?.reduce((sum, b) => sum + (b.products_count ?? 0), 0) ?? 0;

  const getBrandInitials = (brandName: string) => {
    const parts = brandName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return brandName.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ======================================================================= */}
      {/* 1. BREADCRUMB & HEADER                                                  */}
      {/* ======================================================================= */}
      <div className="space-y-3">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500"
        >
          <Link
            href="/admin/dashboard"
            className="hover:text-blue-600 transition-colors"
          >
            Admin Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-900 font-bold" aria-current="page">
            Brands
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              BRAND REGISTRY
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Brands
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage manufacturers and brand identities across the NeuroCommerce product catalog.
            </p>
          </div>

          <Can permission="brand.create">
            <Button
              onClick={handleOpenCreate}
              className="h-10 px-4 gap-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold shadow-xs"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Brand</span>
            </Button>
          </Can>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. SUMMARY METRICS                                                      */}
      {/* ======================================================================= */}
      {brands && brands.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Brands
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalBrands}
            </span>
          </div>

          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Manufacturers
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {activeBrands} Active
            </span>
          </div>

          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Assigned Products
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalProductsAssigned}
            </span>
          </div>

          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Registry Status
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
            <div className="relative flex items-center w-full">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Search className="h-4 w-4" aria-hidden="true" />
              </div>
              <Input
                placeholder="Search brands by name, slug, or website..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-10 rounded-xl bg-slate-50 border-slate-200/80 text-xs w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              aria-label="Filter by brand status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200/80 bg-slate-50 px-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 4. BRANDS TABLE & STATES                                                */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-14 w-full rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 rounded-[20px] bg-red-50/50 border border-red-200 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto" aria-hidden="true" />
          <h2 className="text-sm font-extrabold text-red-900">
            Failed to Load Brands
          </h2>
          <p className="text-xs text-red-600 max-w-sm mx-auto">
            Unable to connect to the brand registry API. Please verify local backend status and try again.
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="h-9 px-4 text-xs font-bold gap-2 bg-white"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Retry Query</span>
          </Button>
        </div>
      ) : filteredBrands && filteredBrands.length > 0 ? (
        <div className="rounded-[20px] bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="py-3.5 px-6">Brand</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Website</th>
                  <th className="py-3.5 px-4">Products</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBrands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-extrabold text-xs border border-blue-100/80 shadow-2xs">
                          {getBrandInitials(brand.name)}
                        </div>
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block">
                            {brand.name}
                          </span>
                          {brand.description && (
                            <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                              {brand.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-500">
                      {brand.slug}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold">
                      {brand.website_url ? (
                        <a
                          href={brand.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <span className="truncate max-w-[180px]">
                            {brand.website_url}
                          </span>
                          <ExternalLink
                            className="h-3 w-3 shrink-0"
                            aria-hidden="true"
                          />
                        </a>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                        {brand.products_count ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {brand.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          <XCircle className="h-3 w-3" aria-hidden="true" />
                          <span>Disabled</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Status Toggle */}
                        <Can permission="brand.update">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(brand)}
                            disabled={togglingBrandId === brand.id}
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                            title={
                              brand.is_active ? "Disable Brand" : "Activate Brand"
                            }
                            aria-label={`Toggle status for ${brand.name}`}
                          >
                            {togglingBrandId === brand.id ? (
                              <RotateCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
                            ) : brand.is_active ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </Can>

                        {/* Edit Button */}
                        <Can permission="brand.update">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(brand)}
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                            title="Edit Brand"
                            aria-label={`Edit ${brand.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Can>

                        {/* Delete Button */}
                        <Can permission="brand.delete">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDelete(brand)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete Brand"
                            aria-label={`Delete ${brand.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Can>

                        {/* Storefront Link */}
                        <Link
                          href={`/brand/${brand.slug}`}
                          target="_blank"
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="View on Storefront"
                          aria-label={`View ${brand.name} on Storefront`}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title={search || statusFilter ? "No Matching Brands" : "No Brands Found"}
          description={
            search || statusFilter
              ? "No manufacturers matched your search criteria."
              : "Register brands and manufacturers to tag catalog products."
          }
          actionLabel="Create Brand"
          onAction={handleOpenCreate}
        />
      )}

      {/* ======================================================================= */}
      {/* 5. CREATION MODAL DIALOG                                                */}
      {/* ======================================================================= */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-[20px] bg-white border border-slate-200/90 shadow-xl max-w-lg">
          <form onSubmit={handleCreate}>
            <DialogHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <DialogTitle className="text-base font-extrabold text-slate-900">
                  Create New Brand
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Add a product brand or manufacturing partner to your registry.
              </DialogDescription>
            </DialogHeader>

            {createError && (
              <div
                role="alert"
                className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <div className="font-semibold">{createError}</div>
              </div>
            )}

            <div className="space-y-4 py-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="create-brand-name"
                  className="text-xs font-bold text-slate-700"
                >
                  Brand Name *
                </label>
                <Input
                  id="create-brand-name"
                  placeholder="e.g. Sony, Apple, NeuroTech"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="create-brand-slug"
                  className="text-xs font-bold text-slate-700"
                >
                  URL Slug
                </label>
                <Input
                  id="create-brand-slug"
                  placeholder="e.g. neuro-tech (auto-generated if empty)"
                  value={createSlug}
                  onChange={(e) => setCreateSlug(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="create-brand-website"
                  className="text-xs font-bold text-slate-700"
                >
                  Official Website
                </label>
                <Input
                  id="create-brand-website"
                  placeholder="https://example.com"
                  value={createWebsiteUrl}
                  onChange={(e) => setCreateWebsiteUrl(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="create-brand-desc"
                  className="text-xs font-bold text-slate-700"
                >
                  Description
                </label>
                <Input
                  id="create-brand-desc"
                  placeholder="Brief manufacturer summary..."
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="create-brand-sort"
                    className="text-xs font-bold text-slate-700"
                  >
                    Sort Order
                  </label>
                  <Input
                    id="create-brand-sort"
                    type="number"
                    min={0}
                    value={createSortOrder}
                    onChange={(e) => setCreateSortOrder(Number(e.target.value))}
                    className="h-11 rounded-xl bg-slate-50 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="create-brand-active"
                    className="text-xs font-bold text-slate-700"
                  >
                    Status
                  </label>
                  <select
                    id="create-brand-active"
                    value={createIsActive ? "true" : "false"}
                    onChange={(e) => setCreateIsActive(e.target.value === "true")}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                  >
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-10 px-4 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={createBrandMutation.isPending}
                className="h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Create Brand
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================================= */}
      {/* 6. EDIT MODAL DIALOG                                                    */}
      {/* ======================================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="rounded-[20px] bg-white border border-slate-200/90 shadow-xl max-w-lg">
          <form onSubmit={handleEdit}>
            <DialogHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <DialogTitle className="text-base font-extrabold text-slate-900">
                  Edit Brand
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Update brand identity and manufacturer metadata.
              </DialogDescription>
            </DialogHeader>

            {editError && (
              <div
                role="alert"
                className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <div className="font-semibold">{editError}</div>
              </div>
            )}

            <div className="space-y-4 py-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-brand-name"
                  className="text-xs font-bold text-slate-700"
                >
                  Brand Name *
                </label>
                <Input
                  id="edit-brand-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-brand-slug"
                  className="text-xs font-bold text-slate-700"
                >
                  URL Slug
                </label>
                <Input
                  id="edit-brand-slug"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-brand-website"
                  className="text-xs font-bold text-slate-700"
                >
                  Official Website
                </label>
                <Input
                  id="edit-brand-website"
                  placeholder="https://example.com"
                  value={editWebsiteUrl}
                  onChange={(e) => setEditWebsiteUrl(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="edit-brand-desc"
                  className="text-xs font-bold text-slate-700"
                >
                  Description
                </label>
                <Input
                  id="edit-brand-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-brand-sort"
                    className="text-xs font-bold text-slate-700"
                  >
                    Sort Order
                  </label>
                  <Input
                    id="edit-brand-sort"
                    type="number"
                    min={0}
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(Number(e.target.value))}
                    className="h-11 rounded-xl bg-slate-50 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="edit-brand-active"
                    className="text-xs font-bold text-slate-700"
                  >
                    Status
                  </label>
                  <select
                    id="edit-brand-active"
                    value={editIsActive ? "true" : "false"}
                    onChange={(e) => setEditIsActive(e.target.value === "true")}
                    className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                  >
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingBrand(null);
                }}
                className="h-10 px-4 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={updateBrandMutation.isPending}
                className="h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================================= */}
      {/* 7. DELETE CONFIRMATION DIALOG                                           */}
      {/* ======================================================================= */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={`Delete Brand "${deletingBrand?.name}"?`}
        description={
          deletingBrand && (deletingBrand.products_count ?? 0) > 0
            ? `Warning: This brand is currently assigned to ${deletingBrand.products_count} product(s). Deleting the brand will remove the brand association from those products, but the products themselves will not be deleted.`
            : `Are you sure you want to delete "${deletingBrand?.name}" (slug: ${deletingBrand?.slug})? This action can be reversed via database restoration, but the brand will immediately be removed from the active catalog.`
        }
        confirmText="Delete Brand"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteBrandMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeletingBrand(null);
        }}
      />
    </div>
  );
}
