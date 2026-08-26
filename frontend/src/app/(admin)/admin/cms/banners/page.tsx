"use client";

import { useState } from "react";
import { Plus, Image as ImageIcon, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useBanners } from "@/hooks/use-cms";
import { cmsService } from "@/services/cms-service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminBannersPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Banner Form State
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState("home_hero");
  const [order, setOrder] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: bannersData, isLoading, isError, refetch } = useBanners();

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      toast.error("Please provide title and image URL.");
      return;
    }

    setIsSubmitting(true);
    try {
      await cmsService.createBanner({
        title,
        image_url: imageUrl,
        link_url: linkUrl || undefined,
        position,
        sort_order: order,
        is_active: true,
      });
      toast.success("Promotional banner created!");
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "banners"] });
      setIsCreateOpen(false);
      setTitle("");
      setImageUrl("");
      setLinkUrl("");
    } catch {
      toast.error("Failed to create banner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, bannerTitle: string) => {
    setBannerToDelete({ id, title: bannerTitle });
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    setIsDeleting(true);
    try {
      await cmsService.deleteBanner(bannerToDelete.id);
      toast.success("Banner deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "banners"] });
      setBannerToDelete(null);
    } catch {
      toast.error("Failed to delete banner.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotional Banners & Carousels"
        description="Configure hero carousel slides, category headers, and promotional marketing strips."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Banner
          </Button>
        }
      />

      {isLoading ? (
        <Card className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </Card>
      ) : isError ? (
        <Card className="p-8 text-center">
          <p className="text-sm font-semibold text-rose-600">Failed to load promotional banners.</p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
            Retry
          </Button>
        </Card>
      ) : bannersData && bannersData.data && bannersData.data.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bannersData.data.map((banner) => (
                <TableRow key={banner.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <TableCell>
                    <div className="h-10 w-20 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200 dark:border-slate-700">
                      {banner.image_url ? (
                        <img src={banner.image_url} alt={banner.title} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-slate-400 m-auto mt-3" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">{banner.title}</div>
                    {banner.link_url && (
                      <span className="text-[10px] text-slate-400 font-mono block truncate">{banner.link_url}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {banner.position}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{banner.order}</TableCell>
                  <TableCell>
                    <Badge
                      variant={banner.is_active ? "success" : "secondary"}
                      className="gap-1 text-[10px]"
                    >
                      {banner.is_active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {banner.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(banner.id, banner.title)}
                      className="text-xs text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="No Promotional Banners"
          description="Create hero banners and promotional marketing campaigns."
          actionLabel="Add Banner"
          onAction={() => setIsCreateOpen(true)}
        />
      )}

      {/* Creation Modal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateBanner}>
            <DialogHeader>
              <DialogTitle>Add Promotional Banner</DialogTitle>
              <DialogDescription>Configure banner image, link target, and layout placement.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Banner Title *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summer Neuro-Enhancement Promo"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Image URL *
                </label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Click URL (Optional)
                </label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/catalog/neural-implants"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  >
                    <option value="home_hero">Home Hero</option>
                    <option value="category_top">Category Top</option>
                    <option value="promo_bar">Promo Bar</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Display Order
                  </label>
                  <Input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Banner
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!bannerToDelete}
        onOpenChange={(open) => {
          if (!open) setBannerToDelete(null);
        }}
        title="Delete promotional banner?"
        description={`Are you sure you want to delete banner "${bannerToDelete?.title}"? This banner will be removed from display.`}
        confirmText="Delete Banner"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
