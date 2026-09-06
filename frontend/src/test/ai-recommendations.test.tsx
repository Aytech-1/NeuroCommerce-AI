import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AiRecommendations } from "@/components/store/ai-recommendations";
import { useSmartRecommendations, useAddToCart } from "@/hooks/use-storefront";
import { ProductItem } from "@/services/catalog-service";

vi.mock("@/hooks/use-storefront", () => ({
  useSmartRecommendations: vi.fn(),
  useAddToCart: vi.fn(),
}));

const mockRecommendations: ProductItem[] = [
  {
    id: "rec-1",
    name: "Synaptic BCI Telemetry Unit",
    slug: "synaptic-bci-telemetry-unit",
    sku: "SBCI-TEL",
    base_price: 999.0,
    sale_price: 849.0,
    stock_quantity: 12,
    stock_status: "in_stock",
    status: "active",
    is_active: true,
    is_featured: true,
    category: { id: "cat-1", name: "Neural Hardware" },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-20T00:00:00Z",
  },
  {
    id: "rec-2",
    name: "Cortex Bio-Amplifier V4",
    slug: "cortex-bio-amplifier-v4",
    sku: "CBA-V4",
    base_price: 649.0,
    stock_quantity: 8,
    stock_status: "in_stock",
    status: "active",
    is_active: true,
    is_featured: false,
    category: { id: "cat-2", name: "Medical Devices" },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-20T00:00:00Z",
  },
  {
    id: "rec-3",
    name: "Neural Wrist Telemetry Band",
    slug: "neural-wrist-telemetry-band",
    sku: "NWT-BAND",
    base_price: 299.0,
    stock_quantity: 4,
    stock_status: "in_stock",
    status: "active",
    is_active: true,
    is_featured: false,
    category: { id: "cat-3", name: "Wearables" },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-20T00:00:00Z",
  },
  {
    id: "rec-4",
    name: "Precision EEG Electrode Gel Kit",
    slug: "precision-eeg-gel-kit",
    sku: "EEG-GEL",
    base_price: 89.0,
    stock_quantity: 100,
    stock_status: "in_stock",
    status: "active",
    is_active: true,
    is_featured: false,
    category: { id: "cat-4", name: "Accessories" },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-20T00:00:00Z",
  },
  {
    id: "rec-5",
    name: "High-Frequency Neural Probe",
    slug: "high-frequency-neural-probe",
    sku: "HF-PROBE",
    base_price: 1299.0,
    stock_quantity: 2,
    stock_status: "in_stock",
    status: "active",
    is_active: true,
    is_featured: true,
    category: { id: "cat-1", name: "Neural Hardware" },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-20T00:00:00Z",
  },
];

describe("AI-Powered Recommendations Suite", () => {
  const mockAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAddToCart).mockReturnValue({
      mutate: mockAddToCart,
      isPending: false,
    } as any);
  });

  it("1. Section Header: renders AI eyebrow, AI status badge, H2 heading, and subtitle", () => {
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: { items: mockRecommendations, isPersonalized: false },
      isLoading: false,
      isError: false,
    } as any);

    render(<AiRecommendations />);

    expect(screen.getByRole("region", { name: /technology selected intelligently for you/i })).toBeInTheDocument();
    expect(screen.getByText("AI-POWERED DISCOVERY")).toBeInTheDocument();
    expect(screen.getByText("AI Recommendation Engine")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /technology selected intelligently for you/i })).toBeInTheDocument();
    expect(screen.getByText(/Our recommendation engine analyzes product telemetry/i)).toBeInTheDocument();

    const exploreLinks = screen.getAllByRole("link", { name: /explore all recommendations/i });
    expect(exploreLinks.length).toBeGreaterThanOrEqual(1);
    expect(exploreLinks[0]).toHaveAttribute("href", "/recommendations");
  });

  it("2. Products Display: renders recommended products and integrates with ProductCard", () => {
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: { items: mockRecommendations, isPersonalized: false },
      isLoading: false,
      isError: false,
    } as any);

    render(<AiRecommendations />);

    expect(screen.getByText("Synaptic BCI Telemetry Unit")).toBeInTheDocument();
    expect(screen.getByText("Cortex Bio-Amplifier V4")).toBeInTheDocument();
    expect(screen.getByText("Neural Wrist Telemetry Band")).toBeInTheDocument();
    expect(screen.getByText("Precision EEG Electrode Gel Kit")).toBeInTheDocument();
    expect(screen.getByText("₦849.00")).toBeInTheDocument();
  });

  it("3. Carousel Navigation: navigates between recommendation pages when products > 4", () => {
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: { items: mockRecommendations, isPersonalized: false },
      isLoading: false,
      isError: false,
    } as any);

    render(<AiRecommendations />);

    const nextBtn = screen.getByRole("button", { name: /next recommendations/i });
    const prevBtn = screen.getByRole("button", { name: /previous recommendations/i });

    expect(prevBtn).toBeDisabled();
    expect(nextBtn).toBeEnabled();

    fireEvent.click(nextBtn);

    expect(screen.getByText("High-Frequency Neural Probe")).toBeInTheDocument();
    expect(prevBtn).toBeEnabled();
  });

  it("4. Loading State: displays recommendation skeletons during fetch", () => {
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    const { container } = render(<AiRecommendations />);
    expect(screen.getByText("Technology Selected Intelligently for You")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("5. Error State: renders clean fallback when recommendation API fails", () => {
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<AiRecommendations />);
    expect(screen.getByText("Recommendations are temporarily unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse products/i })).toHaveAttribute("href", "/products");
  });

  it("6. Empty State: renders friendly fallback when 0 recommendations returned", () => {
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: { items: [], isPersonalized: false },
      isLoading: false,
      isError: false,
    } as any);

    render(<AiRecommendations />);
    expect(screen.getByText("Discover Technology You'll Love")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore catalog/i })).toHaveAttribute("href", "/products");
  });

  it("7. Personalized State: displays personalized badge and text when user is authenticated", () => {
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: { items: mockRecommendations, isPersonalized: true },
      isLoading: false,
      isError: false,
    } as any);

    render(<AiRecommendations />);
    expect(screen.getByText("PERSONALIZED SELECTION")).toBeInTheDocument();
    expect(screen.getByText("Tailored to Your Activity")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /recommended specifically for you/i })).toBeInTheDocument();
  });
});
