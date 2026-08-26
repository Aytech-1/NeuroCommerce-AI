"use client";

import { useState } from "react";
import { Plus, MessageSquare, Trash2, Star } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useTestimonials } from "@/hooks/use-cms";
import { cmsService } from "@/services/cms-service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<{ id: string; author: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [authorName, setAuthorName] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: testimonials, isLoading, isError, refetch } = useTestimonials();

  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) {
      toast.error("Please provide both author and quote content.");
      return;
    }

    setIsSubmitting(true);
    try {
      await cmsService.createTestimonial({
        author: authorName,
        company: company || undefined,
        content,
        rating,
        is_active: true,
      });
      toast.success("Testimonial added successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "testimonials"] });
      setIsCreateOpen(false);
      setAuthorName("");
      setCompany("");
      setContent("");
    } catch {
      toast.error("Failed to create testimonial.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, author: string) => {
    setTestimonialToDelete({ id, author });
  };

  const handleConfirmDelete = async () => {
    if (!testimonialToDelete) return;
    setIsDeleting(true);
    try {
      await cmsService.deleteTestimonial(testimonialToDelete.id);
      toast.success("Testimonial deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "testimonials"] });
      setTestimonialToDelete(null);
    } catch {
      toast.error("Failed to delete testimonial.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Testimonials & Case Studies"
        description="Curate clinical trial citations, laboratory endorsements, and customer success reviews."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Testimonial
          </Button>
        }
      />

      {isLoading ? (
        <Card className="p-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </Card>
      ) : isError ? (
        <Card className="p-8 text-center">
          <p className="text-sm font-semibold text-rose-600">Failed to load testimonials.</p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
            Retry
          </Button>
        </Card>
      ) : testimonials && testimonials.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {testimonials.map((t) => (
            <Card key={t.id} className="p-4 flex flex-col justify-between hover:shadow-sm transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100">{t.author_name}</h3>
                    {t.company && <p className="text-[10px] text-slate-400">{t.company}</p>}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{t.content}"</p>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(t.id, t.author_name)}
                  className="text-xs text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No Testimonials"
          description="Add clinical endorsements and verified purchaser reviews."
          actionLabel="Add Testimonial"
          onAction={() => setIsCreateOpen(true)}
        />
      )}

      {/* Creation Modal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateTestimonial}>
            <DialogHeader>
              <DialogTitle>Add Testimonial</DialogTitle>
              <DialogDescription>Feature a customer or clinical review.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Author Name *
                  </label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Dr. Aris Thorne"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Company / Lab
                  </label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Synapse Labs Zurich"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Rating (1-5)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value, 10) || 5)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Testimonial Quote *
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="The latency reduction on the Neural Interface V2 is groundbreaking..."
                  rows={4}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Testimonial
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!testimonialToDelete}
        onOpenChange={(open) => {
          if (!open) setTestimonialToDelete(null);
        }}
        title="Delete customer testimonial?"
        description={`Are you sure you want to delete the testimonial from "${testimonialToDelete?.author}"?`}
        confirmText="Delete Testimonial"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
