import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StorefrontHomePage from "@/app/(store)/page";
import StorefrontProductsPage from "@/app/(store)/products/page";
import {
  useFeaturedProducts,
  useTrendingRecommendations,
  useCategoriesTree,
  usePublicProducts,
  useBrands,
  useAddToCart,
} from "@/hooks/use-storefront";
import { ProductItem } from "@/services/catalog-service";

vi.mock("@/hooks/use-storefront", () => ({
  useFeaturedProducts: vi.fn(),
  useTrendingRecommendations: vi.fn(),
  useSmartRecommendations: vi.fn(() => ({ data: { items: [], isPersonalized: false }, isLoading: false, isError: false })),
  usePersonalizedRecommendations: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
  useRecentlyViewedRecommendations: vi.fn(() => ({ data: [], isLoading: false, isError: false })),
  useDealsProducts: vi.fn(() => ({ data: { data: [] }, isLoading: false, isError: false })),
  useCategoriesTree: vi.fn(),
  usePublicProducts: vi.fn(),
  useBrands: vi.fn(),
  useAddToCart: vi.fn(),
  useSearchSuggestions: vi.fn(() => ({ data: [] })),
}));

vi.mock("@/hooks/use-cms", () => ({
  useBlogPosts: vi.fn(() => ({ data: { data: [] }, isLoading: false, isError: false })),
}));

const mockProduct: ProductItem = {
  id: "prod-1",
  name: "Neural Interface V2 Pro",
  slug: "neural-interface-v2-pro",
  sku: "NIV2-PRO",
  base_price: 599.99,
  sale_price: 499.99,
  status: "active",
  is_active: true,
  is_featured: true,
  category: {
    id: "cat-1",
    name: "Neural Headsets",
  },
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

describe("Storefront Home & Catalog Suite", () => {
  const mockAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAddToCart).mockReturnValue({
      mutate: mockAddToCart,
      isPending: false,
    } as any);

    vi.mocked(useCategoriesTree).mockReturnValue({
      data: [{ id: "cat-1", name: "Neural Headsets", slug: "neural-headsets", is_active: true, products_count: 5 }],
      isLoading: false,
    } as any);

    vi.mocked(useBrands).mockReturnValue({
      data: [{ id: "br-1", name: "Synapse Labs", slug: "synapse-labs", is_active: true }],
      isLoading: false,
    } as any);
  });

  it("renders homepage with hero headline and featured products", () => {
    vi.mocked(useFeaturedProducts).mockReturnValue({
      data: [mockProduct],
      isLoading: false,
    } as any);

    vi.mocked(useTrendingRecommendations).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<StorefrontHomePage />);

    expect(screen.getByText(/Precision Technology for the Next Generation/i)).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText("₦499.99")).toBeInTheDocument();
  });

  it("renders catalog product listing with product cards and filter sidebar", () => {
    vi.mocked(usePublicProducts).mockReturnValue({
      data: {
        data: [mockProduct],
        meta: { current_page: 1, per_page: 12, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<StorefrontProductsPage />);

    expect(screen.getByText("Hardware Catalog")).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText("Refine Search")).toBeInTheDocument();
  });

  it("triggers quick add to cart on product card button click", () => {
    vi.mocked(usePublicProducts).mockReturnValue({
      data: {
        data: [mockProduct],
        meta: { current_page: 1, per_page: 12, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<StorefrontProductsPage />);

    const addButtons = screen.getAllByLabelText(/add to cart/i);
    fireEvent.click(addButtons[0]);

    expect(mockAddToCart).toHaveBeenCalledWith({
      productId: "prod-1",
      quantity: 1,
    });
  });
});
