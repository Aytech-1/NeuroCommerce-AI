import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminReviewsPage from "@/app/(admin)/admin/reviews/page";
import {
  useReviews,
  useApproveReview,
  useRejectReview,
  useToggleFeatureReview,
  useReplyToReview,
  useDeleteReview,
} from "@/hooks/use-reviews";
import { ReviewItem } from "@/services/review-service";

vi.mock("@/hooks/use-reviews", () => ({
  useReviews: vi.fn(),
  useApproveReview: vi.fn(),
  useRejectReview: vi.fn(),
  useToggleFeatureReview: vi.fn(),
  useReplyToReview: vi.fn(),
  useDeleteReview: vi.fn(),
}));

const mockReview: ReviewItem = {
  id: "rev-1",
  product_id: "prod-1",
  product: {
    id: "prod-1",
    name: "Neural Interface V2",
    sku: "NIV2-01",
    slug: "neural-interface-v2",
  },
  user_id: "u-1",
  user: {
    id: "u-1",
    first_name: "Dr. Gregory",
    last_name: "House",
    email: "house@princeton.edu",
  },
  rating: 5,
  title: "Outstanding Latency Reduction",
  body: "The EEG sensor calibration is virtually instantaneous. Ideal for motor cortex research.",
  is_verified_purchase: true,
  is_approved: false,
  is_featured: true,
  helpful_count: 18,
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

describe("Admin Reviews Moderation Suite", () => {
  const mockApprove = vi.fn();
  const mockReject = vi.fn();
  const mockFeature = vi.fn();
  const mockReply = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useApproveReview).mockReturnValue({
      mutateAsync: mockApprove,
      isPending: false,
    } as any);

    vi.mocked(useRejectReview).mockReturnValue({
      mutateAsync: mockReject,
      isPending: false,
    } as any);

    vi.mocked(useToggleFeatureReview).mockReturnValue({
      mutateAsync: mockFeature,
      isPending: false,
    } as any);

    vi.mocked(useReplyToReview).mockReturnValue({
      mutateAsync: mockReply,
      isPending: false,
    } as any);

    vi.mocked(useDeleteReview).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("renders review queue with product, reviewer, and verified badge", () => {
    vi.mocked(useReviews).mockReturnValue({
      data: {
        data: [mockReview],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminReviewsPage />);

    expect(screen.getByText("Neural Interface V2")).toBeInTheDocument();
    expect(screen.getByText(/By Dr. Gregory House/i)).toBeInTheDocument();
    expect(screen.getByText("Outstanding Latency Reduction")).toBeInTheDocument();
    expect(screen.getByText("Verified Purchase")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("Pending Review")).toBeInTheDocument();
  });

  it("triggers approve review mutation on click", () => {
    vi.mocked(useReviews).mockReturnValue({
      data: {
        data: [mockReview],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminReviewsPage />);

    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect(mockApprove).toHaveBeenCalledWith("rev-1");
  });
});
