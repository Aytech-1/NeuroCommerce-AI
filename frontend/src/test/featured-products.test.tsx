import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeaturedProducts } from "@/components/store/featured-products";
import { ProductCard } from "@/components/store/product-card";
import { useFeaturedProducts, useAddToCart } from "@/hooks/use-storefront";
import { ProductItem } from "@/services/catalog-service";

vi.mock("@/hooks/use-storefront", () => ({
  useFeaturedProducts: vi.fn(),
  useAddToCart: vi.fn(),
}));

const mockProducts: ProductItem[] = [
  {
    id: "prod-1",
    name: "NeuroTech EEG Headset Pro",
    slug: "neurotech-eeg-headset-pro",
    sku: "NT-EEG-PRO",
    base_price: 1499.0,
    sale_price: 1249.0,
    stock_quantity: 25,
    stock_status: "in_stock",
    status: "active",
    is_active: true,
    is_featured: true,
    category: {
      id: "cat-1",
      name: "Neural Hardware",
    },
    primary_image: {
      id: "img-1",
      url: "/images/neurotech-headset.png",
      alt_text: "NeuroTech EEG Headset Pro Front View",
    },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-20T00:00:00Z",
  },
  {
    id: "prod-2",
    name: "NeuroMonitor Clinical System",
    slug: "neuromonitor-clinical-system",
    sku: "NM-CLINICAL",
    base_price: 3299.0,
    sale_price: 2899.0,
    stock_quantity: 3,
    stock_status: "in_stock",
    status: "active",
    is_active: true,
    is_featured: true,
    category: {
      id: "cat-2",
      name: "Medical Devices",
    },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-20T00:00:00Z",
  },
  {
    id: "prod-3",
    name: "LabPro Research Microscope",
    slug: "labpro-research-microscope",
    sku: "LP-MICROSCOPE",
    base_price: 2199.0,
    sale_price: 1799.0,
    stock_quantity: 0,
    stock_status: "out_of_stock",
    status: "active",
    is_active: true,
    is_featured: false,
    category: {
      id: "cat-3",
      name: "Laboratory Equipment",
    },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-20T00:00:00Z",
  },
];

describe("Featured Products / Product Showcase Suite", () => {
  const mockAddToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAddToCart).mockReturnValue({
      mutate: mockAddToCart,
      isPending: false,
    } as any);
  });

  it("1. Featured Products Header: renders eyebrow, H2 heading, subtitle, and View All link", () => {
    vi.mocked(useFeaturedProducts).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false,
    } as any);

    render(<FeaturedProducts />);

    expect(screen.getByText("FEATURED PRODUCTS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /explore featured technology/i })).toBeInTheDocument();
    expect(screen.getByText(/Discover advanced devices and technology selected for performance/i)).toBeInTheDocument();
    const viewAllLinks = screen.getAllByRole("link", { name: /view all products/i });
    expect(viewAllLinks.length).toBeGreaterThanOrEqual(1);
    expect(viewAllLinks[0]).toHaveAttribute("href", "/products");
  });

  it("2. Product Card Details: renders product name, category, pricing, and stock status", () => {
    vi.mocked(useFeaturedProducts).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false,
    } as any);

    render(<FeaturedProducts />);

    // Product 1
    expect(screen.getByText(/Neural Hardware/i)).toBeInTheDocument();
    expect(screen.getByText("NeuroTech EEG Headset Pro")).toBeInTheDocument();
    expect(screen.getByText("$1,249.00")).toBeInTheDocument();
    expect(screen.getByText("$1,499.00")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
    expect(screen.getAllByText("Featured").length).toBeGreaterThanOrEqual(1);

    // Image alt
    const img = screen.getByAltText("NeuroTech EEG Headset Pro Front View");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/neurotech-headset.png");

    // Product 2 (Low stock)
    expect(screen.getByText(/Medical Devices/i)).toBeInTheDocument();
    expect(screen.getByText("NeuroMonitor Clinical System")).toBeInTheDocument();
    expect(screen.getByText("Low Stock (3 left)")).toBeInTheDocument();

    // Product 3 (Out of stock)
    expect(screen.getByText(/Laboratory Equipment/i)).toBeInTheDocument();
    expect(screen.getByText("LabPro Research Microscope")).toBeInTheDocument();
    expect(screen.getAllByText("Out of Stock").length).toBeGreaterThanOrEqual(1);
  });

  it("3. Product Links: links correctly to individual product detail pages", () => {
    vi.mocked(useFeaturedProducts).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false,
    } as any);

    render(<FeaturedProducts />);

    const productLinks = screen.getAllByRole("link", { name: /neurotech eeg headset pro/i });
    expect(productLinks[0]).toHaveAttribute("href", "/products/neurotech-eeg-headset-pro");
  });

  it("4. Add to Cart & Wishlist Interactions: triggers mutations and toggles state", () => {
    render(<ProductCard product={mockProducts[0]} />);

    // Wishlist toggle
    const wishlistBtn = screen.getByRole("button", { name: /add to wishlist/i });
    fireEvent.click(wishlistBtn);
    expect(screen.getByRole("button", { name: /remove from wishlist/i })).toBeInTheDocument();

    // Add to cart click
    const addBtn = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(addBtn);
    expect(mockAddToCart).toHaveBeenCalledWith({
      productId: "prod-1",
      quantity: 1,
    });
  });

  it("5. Disabled State: disables Add to Cart for out of stock items", () => {
    render(<ProductCard product={mockProducts[2]} />);

    const disabledBtn = screen.getByRole("button", { name: /add to cart/i });
    expect(disabledBtn).toBeDisabled();
    expect(disabledBtn).toHaveTextContent(/out of stock/i);
  });

  it("6. Loading State: displays skeletons during API fetch", () => {
    vi.mocked(useFeaturedProducts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    const { container } = render(<FeaturedProducts />);
    expect(screen.getByText("Explore Featured Technology")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(8);
  });

  it("7. Error State: displays resilient fallback when API fails", () => {
    vi.mocked(useFeaturedProducts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<FeaturedProducts />);
    expect(screen.getByText("Featured products are temporarily unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse all products/i })).toHaveAttribute("href", "/products");
  });

  it("8. Empty State: displays friendly message when 0 featured products returned", () => {
    vi.mocked(useFeaturedProducts).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    render(<FeaturedProducts />);
    expect(screen.getByText("Discover Our Products")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse catalog/i })).toHaveAttribute("href", "/products");
  });
});
