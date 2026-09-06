import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DealsSection } from "@/components/store/deals-section";
import { useDealsProducts, useAddToCart } from "@/hooks/use-storefront";
import { ProductItem } from "@/services/catalog-service";

vi.mock("@/hooks/use-storefront", () => ({
  useDealsProducts: vi.fn(),
  useAddToCart: vi.fn(),
}));

const mockDeals: ProductItem[] = [
  {
    id: "deal-1",
    name: "Neural Signal Analyzer Pro",
    slug: "neural-signal-analyzer-pro",
    sku: "NSA-PRO",
    base_price: 1099.0,
    sale_price: 899.0,
    stock_quantity: 15,
    stock_status: "in_stock",
    status: "active",
    is_active: true,
    is_featured: false,
    category: { id: "cat-1", name: "Neural Hardware" },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-20T00:00:00Z",
  },
  {
    id: "deal-2",
    name: "Clinical Bio-Stimulator Unit",
    slug: "clinical-bio-stimulator-unit",
    sku: "CBS-UNIT",
    base_price: 799.0,
    sale_price: 599.0,
    stock_quantity: 5,
    stock_status: "in_stock",
    status: "active",
    is_active: true,
    is_featured: true,
    category: { id: "cat-2", name: "Medical Devices" },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-20T00:00:00Z",
  },
];

describe("Deals & Special Offers Suite", () => {
  const mockAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAddToCart).mockReturnValue({
      mutate: mockAddToCart,
      isPending: false,
    } as any);
  });

  it("1. Section Header: renders eyebrow, H2 heading, subtitle, and View All Deals link", () => {
    vi.mocked(useDealsProducts).mockReturnValue({
      data: { data: mockDeals },
      isLoading: false,
      isError: false,
    } as any);

    render(<DealsSection />);

    // Accessible landmark
    expect(screen.getByRole("region", { name: /exceptional technology\. better value\./i })).toBeInTheDocument();

    // Eyebrow and Heading
    expect(screen.getByText("LIMITED-TIME OFFERS")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /exceptional technology\. better value\./i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Explore current offers on selected technology and equipment while available\./i)
    ).toBeInTheDocument();

    // View All Deals Link
    const viewAllLinks = screen.getAllByRole("link", { name: /view all deals/i });
    expect(viewAllLinks.length).toBeGreaterThanOrEqual(1);
    expect(viewAllLinks[0]).toHaveAttribute("href", "/products");
  });

  it("2. Deal Products: renders deal items with actual sale price and compare-at base price", () => {
    vi.mocked(useDealsProducts).mockReturnValue({
      data: { data: mockDeals },
      isLoading: false,
      isError: false,
    } as any);

    render(<DealsSection />);

    // Deal 1
    expect(screen.getByText("Neural Signal Analyzer Pro")).toBeInTheDocument();
    expect(screen.getByText("₦899.00")).toBeInTheDocument();
    expect(screen.getByText("₦1,099.00")).toBeInTheDocument();

    // Deal 2
    expect(screen.getByText("Clinical Bio-Stimulator Unit")).toBeInTheDocument();
    expect(screen.getByText("₦599.00")).toBeInTheDocument();
    expect(screen.getByText("₦799.00")).toBeInTheDocument();
  });

  it("3. Loading State: displays skeletons during fetch", () => {
    vi.mocked(useDealsProducts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    const { container } = render(<DealsSection />);
    expect(screen.getByText("Exceptional Technology. Better Value.")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("4. Error State: renders clean fallback when deals API fails", () => {
    vi.mocked(useDealsProducts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<DealsSection />);
    expect(screen.getByText("Special offers are temporarily unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse products/i })).toHaveAttribute("href", "/products");
  });

  it("5. Empty State: renders friendly message when 0 deals returned", () => {
    vi.mocked(useDealsProducts).mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    } as any);

    render(<DealsSection />);
    expect(screen.getByText("No Special Offers Right Now")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse catalog/i })).toHaveAttribute("href", "/products");
  });
});
