"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Tag,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  RotateCw,
  AlertCircle,
  Building2,
  Globe,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Can } from "@/components/ui/can";
import { useBrands } from "@/hooks/use-catalog";
import { catalogService } from "@/services/catalog-service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const { data: brands, isLoading, isError, refetch } = useBrands();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await catalogService.createBrand({
        name: name.trim(),
        slug: slug.trim() || undefined,
        website_url: websiteUrl.trim() || undefined,
        description: description.trim() || undefined,
        is_active: true,
      });
      toast.success("Brand created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setIsCreateOpen(false);
      setName("");
      setSlug("");
      setWebsiteUrl("");
      setDescription("");
    } catch {
      toast.error("Failed to create brand.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBrands = brands?.filter((brand) => {
    const matchesSearch =
      !search ||
      brand.name.toLowerCase().includes(search.toLowerCase()) ||
      brand.slug.toLowerCase().includes(search.toLowerCase()) ||
      (brand.website_url && brand.website_url.toLowerCase().includes(search.toLowerCase())) ||
      (brand.description && brand.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && brand.is_active) ||
      (statusFilter === "disabled" && !brand.is_active);

    return matchesSearch && matchesStatus;
  });

  const totalBrands = brands?.length ?? 0;
  const activeBrands = brands?.filter((b) => b.is_active).length ?? 0;
  const totalProductsAssigned = brands?.reduce((sum, b) => sum + (b.products_count ?? 0), 0) ?? 0;

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
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
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
              onClick={() => setIsCreateOpen(true)}
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
              {totalBrands} Brands
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
              {totalProductsAssigned} Products
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
            <Input
              placeholder="Search brands or manufacturers..."
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
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Brands</option>
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
      {/* 4. BRANDS TABLE                                                         */}
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
          <h3 className="text-base font-extrabold text-slate-900">Failed to load brand registry</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to communicate with the brand management service.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Retry Loading
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
                  <tr key={brand.id} className="hover:bg-slate-50/70 transition-colors">
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
                          <span className="truncate max-w-[180px]">{brand.website_url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
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
                        <Link
                          href={`/brand/${brand.slug}`}
                          target="_blank"
                          className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="View on Storefront"
                          aria-label="View on Storefront"
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
          onAction={() => setIsCreateOpen(true)}
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

            <div className="space-y-4 py-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Brand Name *</label>
                <Input
                  placeholder="e.g. Sony, Apple, NeuroTech"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">URL Slug</label>
                <Input
                  placeholder="e.g. neuro-tech (auto-generated if empty)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Official Website</label>
                <Input
                  placeholder="https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <Input
                  placeholder="Brief manufacturer summary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11 rounded-xl bg-slate-50 text-xs"
                />
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
                isLoading={isSubmitting}
                className="h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
              >
                Create Brand
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
