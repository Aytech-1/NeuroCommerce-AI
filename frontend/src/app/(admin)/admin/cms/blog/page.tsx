"use client";

import { useState } from "react";
import { Plus, Search, BookOpen, Trash2, Globe, FileEdit } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { useBlogPosts } from "@/hooks/use-cms";
import { cmsService } from "@/services/cms-service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Post Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newCategory, setNewCategory] = useState("Neuroscience");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newStatus, setNewStatus] = useState<"draft" | "published">("published");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError, refetch } = useBlogPosts({
    page,
    per_page: 10,
    search: search.trim() || undefined,
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSlug.trim() || !newContent.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await cmsService.createBlogPost({
        title: newTitle.trim(),
        slug: newSlug.trim().toLowerCase(),
        excerpt: newExcerpt.trim() || undefined,
        content: newContent.trim(),
        status: newStatus,
      });

      toast.success("Blog article published successfully.");
      setIsCreateOpen(false);
      setNewTitle("");
      setNewSlug("");
      setNewExcerpt("");
      setNewContent("");
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "blog"] });
    } catch {
      toast.error("Failed to create blog post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    setPostToDelete({ id, title });
  };

  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await cmsService.deleteBlogPost(postToDelete.id);
      toast.success("Blog post deleted.");
      queryClient.invalidateQueries({ queryKey: ["admin", "cms", "blog"] });
      setPostToDelete(null);
    } catch {
      toast.error("Failed to delete post.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog & Industry Insights"
        description="Publish neuroscience research summaries, technological updates, and editorial content."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Blog Post
          </Button>
        }
      />

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search articles by title or keyword..."
              prefixIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      {isLoading ? (
        <Card className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </Card>
      ) : isError ? (
        <Card className="p-8 text-center">
          <p className="text-sm font-semibold text-rose-600">Failed to load blog posts.</p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
            Retry
          </Button>
        </Card>
      ) : data?.data && data.data.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((post) => (
                <TableRow key={post.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block truncate">
                          {post.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">/{post.slug}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {post.category || "General"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={post.status === "published" ? "success" : "secondary"}
                      className="text-[10px] capitalize gap-1"
                    >
                      {post.status === "published" ? <Globe className="h-3 w-3" /> : <FileEdit className="h-3 w-3" />}
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {post.published_at ? formatDate(post.published_at) : formatDate(post.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post.id, post.title)}
                      className="text-xs text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {data.meta && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <Pagination
                currentPage={data.meta.current_page}
                totalPages={data.meta.last_page || Math.ceil(data.meta.total / (data.meta.per_page || 15))}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </Card>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No Blog Posts"
          description="Publish research articles and commercial announcements."
          actionLabel="New Blog Post"
          onAction={() => setIsCreateOpen(true)}
        />
      )}

      {/* Creation Modal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleCreatePost}>
            <DialogHeader>
              <DialogTitle>New Blog Post</DialogTitle>
              <DialogDescription>Draft and publish an insight article.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Article Title *
                </label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Future of Neural BCI Interfaces..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Slug
                  </label>
                  <Input
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="neural-bci-future"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Category
                  </label>
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Neuroscience"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Article Content *
                </label>
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write post content in markdown or plain text..."
                  rows={6}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Publish Article
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!postToDelete}
        onOpenChange={(open) => {
          if (!open) setPostToDelete(null);
        }}
        title="Delete blog article?"
        description={`Are you sure you want to delete article "${postToDelete?.title}"? This post will be permanently removed.`}
        confirmText="Delete Article"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
