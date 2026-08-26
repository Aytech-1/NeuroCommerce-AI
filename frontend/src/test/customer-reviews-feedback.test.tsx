import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CustomerReviewsPage from "@/app/(portal)/account/reviews/page";
import { useCustomerReviews } from "@/hooks/use-customer";

vi.mock("@/hooks/use-customer", () => ({
  useCustomerReviews: vi.fn(),
}));

const mockReview1 = {
  id: "rev-1",
  product_id: "prod-1",
  rating: 5,
  title: "Exceptional Neural Interface Sensitivity",
  body: "The SNR on this unit surpasses our previous laboratory benchmarks. Highly recommended for EEG research.",
  is_verified_purchase: true,
  is_approved: true,
  is_featured: false,
  helpful_count: 3,
  admin_reply: "Thank you for the detailed feedback! We are thrilled our EEG sensors are supporting your research.",
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
  images: ["/images/neural-interface.png"],
  product: {
    id: "prod-1",
    name: "Neural Interface V2 Pro",
    sku: "NIV2-PRO",
    slug: "neural-interface-v2-pro",
  },
};

const mockReview2 = {
  id: "rev-2",
  product_id: "prod-2",
  rating: 4,
  title: "Solid Wireless EEG Cap",
  body: "Setup was straightforward. Battery life holds up well for continuous 8-hour recording sessions.",
  is_verified_purchase: false,
  is_approved: true,
  is_featured: false,
  helpful_count: 0,
  admin_reply: null,
  created_at: "2026-08-18T00:00:00Z",
  updated_at: "2026-08-18T00:00:00Z",
  product: {
    id: "prod-2",
    name: "EEG Wireless Cap",
    sku: "EEGCAP-W",
    slug: "eeg-wireless-cap",
  },
};

describe("Customer Reviews & Product Feedback Suite (STEP 26.13)", () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCustomerReviews).mockReturnValue({
      data: {
        data: [mockReview1, mockReview2],
        meta: { current_page: 1, per_page: 10, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);
  });

  it("1. Header & Count: renders title, eyebrow, and authoritative review count", () => {
    render(<CustomerReviewsPage />);

    expect(screen.getByText("PRODUCT FEEDBACK")).toBeInTheDocument();
    expect(screen.getByText("My Reviews")).toBeInTheDocument();
    expect(screen.getByText("2 submitted reviews")).toBeInTheDocument();
  });

  it("2. Review Details: renders product name, star rating, verified badge, title, body, and timestamp", () => {
    render(<CustomerReviewsPage />);

    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText("EEG Wireless Cap")).toBeInTheDocument();
    expect(screen.getByText("Exceptional Neural Interface Sensitivity")).toBeInTheDocument();
    expect(screen.getByText(/The SNR on this unit surpasses/i)).toBeInTheDocument();
    expect(screen.getByText("Verified Purchase")).toBeInTheDocument();
    expect(screen.getByText("5.0")).toBeInTheDocument();
    expect(screen.getByText("4.0")).toBeInTheDocument();
  });

  it("3. Official Response: renders engineering response panel when present", () => {
    render(<CustomerReviewsPage />);

    expect(screen.getByText(/NeuroCommerce Engineering Response:/i)).toBeInTheDocument();
    expect(screen.getByText(/Thank you for the detailed feedback!/i)).toBeInTheDocument();
  });

  it("4. Product Links: renders clickable links to product detail page", () => {
    render(<CustomerReviewsPage />);

    const productLinks = screen.getAllByRole("link", { name: /neural interface v2 pro/i });
    expect(productLinks[0]).toHaveAttribute("href", "/products/neural-interface-v2-pro");

    const viewProductLinks = screen.getAllByRole("link", { name: /view product/i });
    expect(viewProductLinks.length).toBe(2);
    expect(viewProductLinks[0]).toHaveAttribute("href", "/products/neural-interface-v2-pro");
  });

  it("5. Filter Toolbar: filters reviews by verified purchase", () => {
    render(<CustomerReviewsPage />);

    const verifiedFilterBtn = screen.getByRole("button", { name: /verified \(1\)/i });
    fireEvent.click(verifiedFilterBtn);

    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.queryByText("EEG Wireless Cap")).not.toBeInTheDocument();
  });

  it("6. Empty State: renders fallback when no reviews exist", () => {
    vi.mocked(useCustomerReviews).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 10, total: 0, last_page: 1 } },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CustomerReviewsPage />);

    expect(screen.getByText("No Reviews Yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore products/i })).toHaveAttribute("href", "/products");
  });

  it("7. Error State: displays error card and triggers retry", () => {
    vi.mocked(useCustomerReviews).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<CustomerReviewsPage />);

    expect(screen.getByText("Unable to load your reviews")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalled();
  });
});
