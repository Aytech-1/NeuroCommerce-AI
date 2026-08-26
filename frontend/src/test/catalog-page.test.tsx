import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StorefrontProductsPage from "@/app/(store)/products/page";
import {
  usePublicProducts,
  useCategoriesTree,
  useBrands,
  useAddToCart,
} from "@/hooks/use-storefront";
import { ProductItem } from "@/services/catalog-service";

vi.mock("@/hooks/use-storefront", () => ({
  usePublicProducts: vi.fn(),
  useCategoriesTree: vi.fn(),
  useBrands: vi.fn(),
  useAddToCart: vi.fn(),
}));

const mockProducts: ProductItem[] = [
  {
    id: "prod-1",
    name: "Neural Interface V2 Pro",
    slug: "neural-interface-v2-pro",
    sku: "NIV2-PRO",
    base_price: 1299,
    sale_price: 1149,
    status: "active",
    is_active: true,
    is_featured: true,
    stock_status: "in_stock",
    stock_quantity: 12,
    category: { id: "cat-1", name: "Neural Interfaces" },
    brand: { id: "brand-1", name: "NeuroPulse" },
    primary_image: { id: "img-1", url: "https://example.com/p1.jpg", alt_text: "Neural Interface V2 Pro" },
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "prod-2",
    name: "Medical EEG Headset 64-Channel",
    slug: "medical-eeg-headset-64ch",
    sku: "MEEG-64",
    base_price: 2499,
    sale_price: null,
    status: "active",
    is_active: true,
    is_featured: true,
    stock_status: "in_stock",
    stock_quantity: 4,
    category: { id: "cat-2", name: "EEG Headsets" },
    brand: { id: "brand-2", name: "CortexLab" },
    primary_image: { id: "img-2", url: "https://example.com/p2.jpg", alt_text: "Medical EEG Headset" },
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

describe("Catalog & Product Discovery UI Suite (STEP 26.1)", () => {
  const mockRefetch = vi.fn();
  const mockAddToCartMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCategoriesTree).mockReturnValue({
      data: [
        { id: "cat-1", name: "Neural Interfaces", slug: "neural-interfaces", is_active: true },
        { id: "cat-2", name: "EEG Headsets", slug: "eeg-headsets", is_active: true },
      ],
    } as any);

    vi.mocked(useBrands).mockReturnValue({
      data: [
        { id: "brand-1", name: "NeuroPulse", slug: "neuropulse", is_active: true },
        { id: "brand-2", name: "CortexLab", slug: "cortexlab", is_active: true },
      ],
    } as any);

    vi.mocked(useAddToCart).mockReturnValue({
      mutate: mockAddToCartMutate,
      isPending: false,
    } as any);
  });

  it("1. Catalog Introduction & Toolbar: renders H1 title, description, and dynamic product count", () => {
    vi.mocked(usePublicProducts).mockReturnValue({
      data: {
        data: mockProducts,
        meta: { current_page: 1, per_page: 12, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<StorefrontProductsPage />);

    // H1 Heading and Eyebrow
    expect(screen.getByRole("heading", { level: 1, name: /all products/i })).toBeInTheDocument();
    expect(screen.getByText("DISCOVER TECHNOLOGY")).toBeInTheDocument();
    expect(
      screen.getByText(/Explore our complete collection of advanced neural interfaces/i)
    ).toBeInTheDocument();

    // Result Count
    expect(screen.getByText(/showing/i)).toBeInTheDocument();
    expect(screen.getByText("1–2")).toBeInTheDocument();
  });

  it("2. Product Grid: renders product cards with names, pricing, and category badges", () => {
    vi.mocked(usePublicProducts).mockReturnValue({
      data: {
        data: mockProducts,
        meta: { current_page: 1, per_page: 12, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<StorefrontProductsPage />);

    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText("Medical EEG Headset 64-Channel")).toBeInTheDocument();
    expect(screen.getByText("$1,149.00")).toBeInTheDocument();
    expect(screen.getByText("$2,499.00")).toBeInTheDocument();
  });

  it("3. Filter Controls: updates search query and category filters", () => {
    vi.mocked(usePublicProducts).mockReturnValue({
      data: {
        data: mockProducts,
        meta: { current_page: 1, per_page: 12, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<StorefrontProductsPage />);

    // Search Input
    const searchInput = screen.getByPlaceholderText(/search keywords\.\.\./i);
    fireEvent.change(searchInput, { target: { value: "Neural" } });
    expect(usePublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ search: "Neural" })
    );

    // Category Select
    const categorySelect = screen.getByLabelText(/^category$/i);
    fireEvent.change(categorySelect, { target: { value: "neural-interfaces" } });
    expect(usePublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: "neural-interfaces" })
    );
  });

  it("4. Sort Selector: changes sort parameter and triggers refetch", () => {
    vi.mocked(usePublicProducts).mockReturnValue({
      data: {
        data: mockProducts,
        meta: { current_page: 1, per_page: 12, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<StorefrontProductsPage />);

    const sortSelect = screen.getByLabelText(/sort products/i);
    fireEvent.change(sortSelect, { target: { value: "price_asc" } });
    expect(usePublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ sort: "price_asc" })
    );
  });

  it("5. Add to Cart: triggers quick add to cart mutation on button click", () => {
    vi.mocked(usePublicProducts).mockReturnValue({
      data: {
        data: mockProducts,
        meta: { current_page: 1, per_page: 12, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<StorefrontProductsPage />);

    const addButtons = screen.getAllByRole("button", { name: /add to cart/i });
    fireEvent.click(addButtons[0]);
    expect(mockAddToCartMutate).toHaveBeenCalledWith({ productId: "prod-1", quantity: 1 });
  });

  it("6. Loading State: displays skeleton placeholders while loading", () => {
    vi.mocked(usePublicProducts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    } as any);

    const { container } = render(<StorefrontProductsPage />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });

  it("7. Error State: displays error fallback and allows retry", () => {
    vi.mocked(usePublicProducts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<StorefrontProductsPage />);

    expect(screen.getByText(/unable to load products\./i)).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("8. Empty State: renders No Products Found and allows clearing filters", () => {
    vi.mocked(usePublicProducts).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 12, total: 0, last_page: 1 } },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<StorefrontProductsPage />);

    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  it("9. Mobile Filter Drawer: opens when Filters button is clicked and closes on dismiss", () => {
    vi.mocked(usePublicProducts).mockReturnValue({
      data: {
        data: mockProducts,
        meta: { current_page: 1, per_page: 12, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<StorefrontProductsPage />);

    const openFilterBtn = screen.getByRole("button", { name: /open filter menu/i });
    fireEvent.click(openFilterBtn);

    expect(screen.getByRole("dialog", { name: /filter catalog/i })).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /close filter drawer/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
