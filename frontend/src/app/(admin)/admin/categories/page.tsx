"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Layers,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  FolderTree,
  Edit2,
  Trash2,
  CornerDownRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Can } from "@/components/ui/can";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-catalog";
import { CategoryItem } from "@/services/category-service";
import { toast } from "sonner";
import { ApiError } from "@/types/api";

export default function AdminCategoriesPage() {
  const { data: categories, isLoading, isError, refetch } = useCategories();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createSlug, setCreateSlug] = useState("");
  const [createParentId, setCreateParentId] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createSortOrder, setCreateSortOrder] = useState<number>(0);
  const [createIsActive, setCreateIsActive] = useState<boolean>(true);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editParentId, setEditParentId] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSortOrder, setEditSortOrder] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  // Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);

  const resetCreateForm = () => {
    setCreateName("");
    setCreateSlug("");
    setCreateParentId("");
    setCreateDescription("");
    setCreateSortOrder(0);
    setCreateIsActive(true);
    setCreateErrorMessage(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    setCreateErrorMessage(null);
    try {
      await createCategoryMutation.mutateAsync({
        name: createName.trim(),
        slug: createSlug.trim() || undefined,
        parent_id: createParentId.trim() || null,
        description: createDescription.trim() || null,
        sort_order: Number(createSortOrder) || 0,
        is_active: createIsActive,
      });
      toast.success(`Category "${createName.trim()}" created successfully!`);
      setIsCreateOpen(false);
      resetCreateForm();
    } catch (err: unknown) {
      const error = err as ApiError;
      setCreateErrorMessage(error.message || "Failed to create category. Please check your inputs.");
      toast.error(error.message || "Failed to create category.");
    }
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditParentId(cat.parent_id || "");
    setEditDescription(cat.description || "");
    setEditSortOrder(cat.sort_order ?? 0);
    setEditIsActive(cat.is_active);
    setEditErrorMessage(null);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;

    setEditErrorMessage(null);
    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory.id,
        payload: {
          name: editName.trim(),
          slug: editSlug.trim() || undefined,
          parent_id: editParentId.trim() || null,
          description: editDescription.trim() || null,
          sort_order: Number(editSortOrder) || 0,
          is_active: editIsActive,
        },
      });
      toast.success(`Category "${editName.trim()}" updated successfully!`);
      setIsEditOpen(false);
      setEditingCategory(null);
    } catch (err: unknown) {
      const error = err as ApiError;
      setEditErrorMessage(error.message || "Failed to update category.");
      toast.error(error.message || "Failed to update category.");
    }
  };

  const handleToggleStatus = async (cat: CategoryItem) => {
    try {
      await updateCategoryMutation.mutateAsync({
        id: cat.id,
        payload: { is_active: !cat.is_active },
      });
      toast.success(`Category "${cat.name}" is now ${!cat.is_active ? "active" : "disabled"}.`);
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.message || "Failed to change category status.");
    }
  };

  const openDeleteDialog = (cat: CategoryItem) => {
    setDeletingCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategoryMutation.mutateAsync(deletingCategory.id);
      toast.success(`Category "${deletingCategory.name}" removed successfully.`);
      setIsDeleteOpen(false);
      setDeletingCategory(null);
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.message || "Failed to delete category.");
    }
  };

  // Helper map for parent category names
  const categoryMap = new Map((categories || []).map((c) => [c.id, c.name]));

  const filteredCategories = categories?.filter((cat) => {
    const matchesSearch =
      !search ||
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.slug.toLowerCase().includes(search.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && cat.is_active) ||
      (statusFilter === "disabled" && !cat.is_active);

    return matchesSearch && matchesStatus;
  });

  const totalCategories = categories?.length ?? 0;
  const activeCategories = categories?.filter((c) => c.is_active).length ?? 0;
  const totalProductsAssigned = categories?.reduce((sum, c) => sum + (c.products_count ?? 0), 0) ?? 0;

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
            Categories
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              CATALOG TAXONOMY
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Categories
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage hierarchical category trees, product grouping, and storefront browsing taxonomies.
            </p>
          </div>

          <Can permission="category.create">
            <Button
              onClick={() => {
                resetCreateForm();
                setIsCreateOpen(true);
              }}
              className="h-10 px-4 gap-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold shadow-xs"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Category</span>
            </Button>
          </Can>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. SUMMARY METRICS                                                      */}
      {/* ======================================================================= */}
      {categories && categories.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Categories
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalCategories}
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Taxonomies
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {activeCategories} Active
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
              Catalog Hierarchy
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
              placeholder="Search categories by name, slug, description..."
              prefixIcon={<Search className="h-4 w-4" aria-hidden="true" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs text-slate-900 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
              <Filter className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
              <span>Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by category status"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Status</option>
              <option value="disabled">Disabled Status</option>
            </select>

            {(search || statusFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
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
      {/* 4. CATEGORIES TABLE                                                     */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-rose-200 shadow-2xs text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Failed to load categories</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to communicate with the catalog taxonomy service.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Retry Loading
          </Button>
        </div>
      ) : filteredCategories && filteredCategories.length > 0 ? (
        <div className="rounded-[20px] bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="py-3.5 px-6">Category Name & Hierarchy</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Products</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((cat) => {
                  const parentName = cat.parent_id ? categoryMap.get(cat.parent_id) : null;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 shadow-2xs">
                            <Layers className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 block">
                              {cat.name}
                            </span>
                            {parentName && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 mt-0.5">
                                <CornerDownRight className="h-3 w-3 text-slate-400" />
                                Subcategory of: <strong className="text-slate-600">{parentName}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-xs text-slate-500">
                        {cat.slug}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-sm truncate">
                        {cat.description || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                          {cat.products_count ?? 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {cat.is_active ? (
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
                          <Link
                            href={`/category/${cat.slug}`}
                            target="_blank"
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                            title="View on Storefront"
                            aria-label={`View ${cat.name} on Storefront`}
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </Link>

                          <Can permission="category.update">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(cat)}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                              title={cat.is_active ? "Disable Category" : "Activate Category"}
                              aria-label={`Toggle status for ${cat.name}`}
                            >
                              {cat.is_active ? (
                                <EyeOff className="h-4 w-4" aria-hidden="true" />
                              ) : (
                                <Eye className="h-4 w-4" aria-hidden="true" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditModal(cat)}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                              title="Edit Category"
                              aria-label={`Edit ${cat.name}`}
                            >
                              <Edit2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </Can>

                          <Can permission="category.delete">
                            <button
                              type="button"
                              onClick={() => openDeleteDialog(cat)}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete Category"
                              aria-label={`Delete ${cat.name}`}
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </Can>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title={search || statusFilter ? "No Matching Categories" : "No Categories Found"}
          description={
            search || statusFilter
              ? "No product categories matched your search criteria."
              : "Create product categories to structure your catalog hierarchy."
          }
          actionLabel="Create Category"
          onAction={() => {
            resetCreateForm();
            setIsCreateOpen(true);
          }}
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
                <FolderTree className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <DialogTitle className="text-base font-extrabold text-slate-900">
                  Create New Category
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Add a product category to organize your catalog hierarchy.
              </DialogDescription>
            </DialogHeader>

            {createErrorMessage && (
              <div
                role="alert"
                className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{createErrorMessage}</span>
              </div>
            )}

            <div className="space-y-4 py-5">
              <div className="space-y-1.5">
                <label htmlFor="create-cat-name" className="text-xs font-bold text-slate-700">Category Name *</label>
                <Input
                  id="create-cat-name"
                  placeholder="e.g. EEG & Neural Interfaces"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-cat-slug" className="text-xs font-bold text-slate-700">URL Slug</label>
                <Input
                  id="create-cat-slug"
                  placeholder="e.g. eeg-neural-interfaces (auto-generated if empty)"
                  value={createSlug}
                  onChange={(e) => setCreateSlug(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-cat-parent" className="text-xs font-bold text-slate-700">Parent Category (Optional)</label>
                <select
                  id="create-cat-parent"
                  value={createParentId}
                  onChange={(e) => setCreateParentId(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="create-cat-desc" className="text-xs font-bold text-slate-700">Description</label>
                <Input
                  id="create-cat-desc"
                  placeholder="Brief category description..."
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="create-cat-sort" className="text-xs font-bold text-slate-700">Sort Order</label>
                  <Input
                    id="create-cat-sort"
                    type="number"
                    min="0"
                    value={createSortOrder}
                    onChange={(e) => setCreateSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="h-11 rounded-xl bg-slate-50 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="create-cat-status" className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    id="create-cat-status"
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
                isLoading={createCategoryMutation.isPending}
                className="h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Create Category
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
          <form onSubmit={handleUpdate}>
            <DialogHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <DialogTitle className="text-base font-extrabold text-slate-900">
                  Edit Category
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Update category metadata, taxonomy hierarchy, and status.
              </DialogDescription>
            </DialogHeader>

            {editErrorMessage && (
              <div
                role="alert"
                className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editErrorMessage}</span>
              </div>
            )}

            <div className="space-y-4 py-5">
              <div className="space-y-1.5">
                <label htmlFor="edit-cat-name" className="text-xs font-bold text-slate-700">Category Name *</label>
                <Input
                  id="edit-cat-name"
                  placeholder="e.g. Neural Interfaces"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-cat-slug" className="text-xs font-bold text-slate-700">URL Slug</label>
                <Input
                  id="edit-cat-slug"
                  placeholder="e.g. neural-interfaces"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-cat-parent" className="text-xs font-bold text-slate-700">Parent Category</label>
                <select
                  id="edit-cat-parent"
                  value={editParentId}
                  onChange={(e) => setEditParentId(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-600"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories
                    ?.filter((c) => c.id !== editingCategory?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="edit-cat-desc" className="text-xs font-bold text-slate-700">Description</label>
                <Input
                  id="edit-cat-desc"
                  placeholder="Brief category description..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="edit-cat-sort" className="text-xs font-bold text-slate-700">Sort Order</label>
                  <Input
                    id="edit-cat-sort"
                    type="number"
                    min="0"
                    value={editSortOrder}
                    onChange={(e) => setEditSortOrder(parseInt(e.target.value, 10) || 0)}
                    className="h-11 rounded-xl bg-slate-50 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-cat-status" className="text-xs font-bold text-slate-700">Status</label>
                  <select
                    id="edit-cat-status"
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
                  setEditingCategory(null);
                }}
                className="h-10 px-4 text-xs font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={updateCategoryMutation.isPending}
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
        title={`Delete Category "${deletingCategory?.name}"?`}
        description={
          deletingCategory?.products_count && deletingCategory.products_count > 0
            ? `Warning: This category currently has ${deletingCategory.products_count} assigned product(s). Deleting will detach products from this category.`
            : "Are you sure you want to delete this category? This action can be reversed via database restoration."
        }
        confirmText="Delete Category"
        variant="danger"
        isLoading={deleteCategoryMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeletingCategory(null);
        }}
      />
    </div>
  );
}
