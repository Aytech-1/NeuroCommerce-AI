import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/reviews",
  useSearchParams: () => new URLSearchParams(),
}));

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
  admin_reply: "Thank you for the detailed clinical benchmark report.",
  admin_reply_at: "2026-08-21T00:00:00Z",
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

describe("Admin Reviews & Product Feedback Moderation Suite (STEP 27.8)", () => {
  const mockApprove = vi.fn();
  const mockReject = vi.fn();
  const mockFeature = vi.fn();
  const mockReply = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useReviews).mockReturnValue({
      data: {
        data: [mockReview],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

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
      mutateAsync: mockDelete,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and breadcrumb navigation", () => {
    render(<AdminReviewsPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("PRODUCT FEEDBACK")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reviews & Feedback", level: 1 })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative review moderation telemetry", () => {
    render(<AdminReviewsPage />);

    expect(screen.getByText("Total Reviews")).toBeInTheDocument();
    expect(screen.getByText("1 Reviews")).toBeInTheDocument();
    expect(screen.getByText("Pending Moderation")).toBeInTheDocument();
    expect(screen.getByText("1 Pending")).toBeInTheDocument();
    expect(screen.getByText("Verified Purchases")).toBeInTheDocument();
    expect(screen.getByText("1 Verified")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search input and renders moderation options", () => {
    render(<AdminReviewsPage />);

    const searchInput = screen.getByPlaceholderText(/search reviews by keyword, product or user/i);
    fireEvent.change(searchInput, { target: { value: "Latency" } });
    expect(searchInput).toHaveValue("Latency");

    expect(screen.getByText("All Moderation States")).toBeInTheDocument();
    expect(screen.getByText("All Ratings")).toBeInTheDocument();
  });

  it("4. Review Feed Item: renders product link, reviewer, rating, verification, content, and official response", () => {
    render(<AdminReviewsPage />);

    expect(screen.getByText("Neural Interface V2")).toBeInTheDocument();
    expect(screen.getByText(/By Dr. Gregory House/i)).toBeInTheDocument();
    expect(screen.getByText("Outstanding Latency Reduction")).toBeInTheDocument();
    expect(screen.getByText(/The EEG sensor calibration is virtually instantaneous/i)).toBeInTheDocument();
    expect(screen.getByText("Verified Purchase")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByText("Pending Review")).toBeInTheDocument();
    expect(screen.getByText("Official Staff Response")).toBeInTheDocument();
    expect(screen.getByText(/Thank you for the detailed clinical benchmark report/i)).toBeInTheDocument();
  });

  it("5. Moderation Actions: triggers approve, feature, and delete actions", () => {
    render(<AdminReviewsPage />);

    fireEvent.click(screen.getByRole("button", { name: /approve/i }));
    expect(mockApprove).toHaveBeenCalledWith("rev-1");

    fireEvent.click(screen.getByRole("button", { name: /unfeature/i }));
    expect(mockFeature).toHaveBeenCalledWith("rev-1");
  });

  it("6. Staff Response Dialog: opens modal and posts official reply", async () => {
    render(<AdminReviewsPage />);

    fireEvent.click(screen.getByRole("button", { name: /edit reply/i }));

    expect(screen.getByText("Post Official Staff Response")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /post response/i }));

    await waitFor(() => {
      expect(mockReply).toHaveBeenCalled();
    });
  });

  it("7. Empty State: renders empty queue notice when 0 reviews exist", () => {
    vi.mocked(useReviews).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 15, total: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminReviewsPage />);

    expect(screen.getByText("No Reviews Found")).toBeInTheDocument();
  });
});
