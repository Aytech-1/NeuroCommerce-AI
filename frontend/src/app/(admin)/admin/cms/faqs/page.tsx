"use client";

import { useState } from "react";
import { Plus, HelpCircle, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useFaqs } from "@/hooks/use-cms";
import { cmsService } from "@/services/cms-service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminFaqsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("General");
  const [order, setOrder] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: faqs, isLoading, isError, refetch } = useFaqs();

  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Please provide both question and answer.");
      return;
    }

    setIsSubmitting(true);
    try {
      await cmsService.createFaq({
        question,
        answer,
        category,
        order,
        is_active: true,
      });
      toast.success("FAQ created successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "faqs"] });
      setIsCreateOpen(false);
      setQuestion("");
      setAnswer("");
    } catch {
      toast.error("Failed to create FAQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setFaqToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!faqToDelete) return;
    setIsDeleting(true);
    try {
      await cmsService.deleteFaq(faqToDelete);
      toast.success("FAQ deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "faqs"] });
      setFaqToDelete(null);
    } catch {
      toast.error("Failed to delete FAQ.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Frequently Asked Questions (FAQs)"
        description="Manage customer knowledge base articles, warranty questions, and clinical compatibility guidance."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add FAQ
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
          <p className="text-sm font-semibold text-rose-600">Failed to load FAQs.</p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
            Retry
          </Button>
        </Card>
      ) : faqs && faqs.length > 0 ? (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <Card key={faq.id} className="p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {faq.category || "General"}
                    </Badge>
                    <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100">{faq.question}</h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 pl-1">{faq.answer}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(faq.id)}
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
          icon={HelpCircle}
          title="No FAQs Configured"
          description="Add frequently asked questions to reduce customer support volume."
          actionLabel="Add FAQ"
          onAction={() => setIsCreateOpen(true)}
        />
      )}

      {/* Creation Modal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreateFaq}>
            <DialogHeader>
              <DialogTitle>Add FAQ</DialogTitle>
              <DialogDescription>Create a customer help entry.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Question *
                </label>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="How do I pair the neural headset?"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Hardware, Pairing, Shipping..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Order
                  </label>
                  <Input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Answer *
                </label>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Step-by-step instructions..."
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
                Save FAQ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!faqToDelete}
        onOpenChange={(open) => {
          if (!open) setFaqToDelete(null);
        }}
        title="Delete this FAQ entry?"
        description="Are you sure you want to delete this FAQ? It will be removed from customer guidance."
        confirmText="Delete FAQ"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
