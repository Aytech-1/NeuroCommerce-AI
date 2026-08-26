"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Star,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Award,
  CornerDownRight,
  Trash2,
  ChevronRight,
  Filter,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import {
  useReviews,
  useApproveReview,
  useRejectReview,
  useToggleFeatureReview,
  useReplyToReview,
  useDeleteReview,
} from "@/hooks/use-reviews";
import { ReviewItem } from "@/services/review-service";
import { toast } from "sonner";

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isApproved, setIsApproved] = useState<string>("");
  const [rating, setRating] = useState<string>("");

  // Reply Modal State
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useReviews({
    page,
    per_page: 15,
    search: search.trim() || undefined,
    is_approved: isApproved !== "" ? isApproved : undefined,
    rating: rating !== "" ? rating : undefined,
  });

  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();
  const featureMutation = useToggleFeatureReview();
  const replyMutation = useReplyToReview();
  const deleteMutation = useDeleteReview();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success("Review approved and published to storefront.");
    } catch {
      toast.error("Failed to approve review.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync(id);
      toast.success("Review rejected and hidden.");
    } catch {
      toast.error("Failed to reject review.");
    }
  };

  const handleToggleFeature = async (id: string, currentlyFeatured: boolean) => {
    try {
      await featureMutation.mutateAsync(id);
      toast.success(`Review ${!currentlyFeatured ? "marked as featured" : "unfeatured"}.`);
    } catch {
      toast.error("Failed to update featured status.");
    }
  };

  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  const handleOpenReply = (review: ReviewItem) => {
    setSelectedReview(review);
    setReplyText(review.admin_reply || "");
    setIsReplyOpen(true);
  };

  const handleSaveReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    try {
      await replyMutation.mutateAsync({
        id: selectedReview.id,
        reply: replyText.trim(),
      });
      toast.success("Official staff response posted.");
      setIsReplyOpen(false);
    } catch {
      toast.error("Failed to post official reply.");
    }
  };

  const handleDelete = (id: string) => {
    setReviewToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await deleteMutation.mutateAsync(reviewToDelete);
      toast.success("Review deleted successfully.");
      setReviewToDelete(null);
    } catch {
      toast.error("Failed to delete review.");
    }
  };

  const totalReviews = data?.meta?.total ?? data?.data?.length ?? 0;
  const approvedCount = data?.data?.filter((r) => r.is_approved).length ?? 0;
  const pendingCount = data?.data?.filter((r) => !r.is_approved).length ?? 0;
  const verifiedCount = data?.data?.filter((r) => r.is_verified_purchase).length ?? 0;

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
            Reviews
          </span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 block">
              PRODUCT FEEDBACK
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Reviews &amp; Feedback
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review customer feedback, monitor product sentiment, and manage verified customer experiences across the NeuroCommerce catalog.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. REVIEWS KPI SUMMARY ROW                                              */}
      {/* ======================================================================= */}
      {data?.data && data.data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Reviews
            </span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {totalReviews} Reviews
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Published &amp; Live
            </span>
            <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
              {approvedCount} Live
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Pending Moderation
            </span>
            <span className="text-xl font-extrabold text-amber-600 mt-1 block">
              {pendingCount} Pending
            </span>
          </div>
          <div className="p-4 rounded-[16px] bg-white border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Verified Purchases
            </span>
            <span className="text-xl font-extrabold text-blue-600 mt-1 block">
              {verifiedCount} Verified
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
              placeholder="Search reviews by keyword, product or user..."
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

            <select
              value={isApproved}
              onChange={(e) => {
                setIsApproved(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Moderation States</option>
              <option value="1">Approved &amp; Live</option>
              <option value="0">Pending / Unapproved</option>
            </select>

            <select
              value={rating}
              onChange={(e) => {
                setRating(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 shadow-2xs"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {(search || isApproved !== "" || rating !== "") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setIsApproved("");
                  setRating("");
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
      {/* 4. REVIEW MODERATION FEED                                               */}
      {/* ======================================================================= */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-[20px]" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-8 sm:p-12 rounded-[20px] bg-white border border-rose-200 shadow-2xs text-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mx-auto">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Failed to load moderation queue</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to communicate with the feedback moderation service.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2 text-xs font-bold">
            Retry Loading
          </Button>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((review) => (
            <div
              key={review.id}
              className={`p-6 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs space-y-4 transition-all hover:border-slate-300 border-l-4 ${
                review.is_approved ? "border-l-emerald-500" : "border-l-amber-500"
              }`}
            >
              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3.5">
                {/* Product & User Meta */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div
                    className="flex items-center gap-0.5 text-amber-400"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  {review.product && (
                    <Link
                      href={`/admin/products/${review.product.id}`}
                      className="font-extrabold text-xs text-blue-600 hover:underline"
                    >
                      {review.product.name}
                    </Link>
                  )}

                  {review.is_verified_purchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                      <span>Verified Purchase</span>
                    </span>
                  )}

                  {review.is_featured && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      <Award className="h-3 w-3" aria-hidden="true" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <span>
                    By {review.user ? `${review.user.first_name} ${review.user.last_name}` : "Anonymous"}
                  </span>
                  <span>•</span>
                  <span>{formatDate(review.created_at)}</span>
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-1">
                {review.title && (
                  <h3 className="font-extrabold text-sm text-slate-900">{review.title}</h3>
                )}
                <p className="text-xs text-slate-600 leading-relaxed">{review.body}</p>
              </div>

              {/* Official Staff Reply */}
              {review.admin_reply && (
                <div className="rounded-xl bg-slate-50 p-4 text-xs border border-slate-200 space-y-1.5">
                  <div className="font-extrabold text-blue-600 flex items-center gap-1.5">
                    <CornerDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Official Staff Response</span>
                    {review.admin_reply_at && (
                      <span className="text-[11px] text-slate-400 ml-auto font-normal">
                        {formatDate(review.admin_reply_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-700 pl-5 font-medium">{review.admin_reply}</p>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      review.is_approved
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {review.is_approved ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        <span>Approved &amp; Live</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                        <span>Pending Review</span>
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3 text-slate-400" aria-hidden="true" />
                    {review.helpful_count} people found helpful
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {!review.is_approved ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprove(review.id)}
                      className="h-8 px-3 text-xs font-bold gap-1 text-emerald-700 hover:text-emerald-800 border-emerald-200 hover:bg-emerald-50 rounded-lg"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Approve</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReject(review.id)}
                      className="h-8 px-3 text-xs font-bold gap-1 text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg"
                    >
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Unpublish</span>
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleFeature(review.id, review.is_featured)}
                    className="h-8 px-3 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-lg"
                  >
                    {review.is_featured ? "Unfeature" : "Feature"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenReply(review)}
                    className="h-8 px-3 text-xs font-bold gap-1 rounded-lg"
                  >
                    <CornerDownRight className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{review.admin_reply ? "Edit Reply" : "Reply"}</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleDelete(review.id)}
                    className="h-8 w-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    aria-label="Delete review"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {data.meta && (
            <div className="p-4 rounded-[20px] bg-white border border-slate-200/90 shadow-2xs">
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
          icon={MessageSquare}
          title="No Reviews Found"
          description="Customer reviews submitted in the storefront will appear here for moderation."
        />
      )}

      {/* Reply Modal Dialog */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="rounded-[20px] bg-white border border-slate-200/90 shadow-xl max-w-md">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CornerDownRight className="h-5 w-5 text-blue-600" aria-hidden="true" />
              <DialogTitle className="text-base font-extrabold text-slate-900">
                Post Official Staff Response
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Your verified response will be publicly visible under this customer review.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <Textarea
              rows={4}
              placeholder="Thank you for your clinical feedback regarding device calibration..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <DialogFooter className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReplyOpen(false)}
              className="h-10 px-4 text-xs font-bold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveReply}
              isLoading={replyMutation.isPending}
              className="h-10 px-5 text-xs font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Post Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!reviewToDelete}
        onOpenChange={(open) => {
          if (!open) setReviewToDelete(null);
        }}
        title="Permanently delete review?"
        description="This customer review will be permanently deleted from the store database. This action cannot be undone."
        confirmText="Delete Review"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
