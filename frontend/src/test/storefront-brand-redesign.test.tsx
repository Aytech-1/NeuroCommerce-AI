import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import BrandsDirectoryPage from "@/app/(store)/brands/page";
import BrandProductsPage from "@/app/(store)/brand/[slug]/page";
import {
  useBrands,
  useBrandBySlug,
  useBrandProducts,
  useAddToCart,
  useToggleWishlist,
} from "@/hooks/use-storefront";
import { BrandItem, ProductItem } from "@/services/catalog-service";

vi.mock("@/hooks/use-storefront", () => ({
  useBrands: vi.fn(),
  useBrandBySlug: vi.fn(),
  useBrandProducts: vi.fn(),
  useAddToCart: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useToggleWishlist: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

const mockBrands: BrandItem[] = [
  {
    id: "br-1",
    name: "CortexDynamics",
    slug: "cortex-dynamics",
    description: "Advanced EEG neural interface hardware and research signal processors.",
    website_url: "https://cortexdynamics.example.com",
    is_active: true,
    products_count: 28,
  },
  {
    id: "br-2",
    name: "NeuroPulse",
    slug: "neuropulse",
    description: "Medical-grade EMG bio-amplifiers and telemetry sensory gear.",
    website_url: "https://neuropulse.example.com",
    is_active: true,
    products_count: 15,
  },
  {
    id: "br-3",
    name: "Synaptic Systems",
    slug: "synaptic-systems",
    description: "Precision micro-electrode arrays and laboratory instrumentation.",
    website_url: null,
    is_active: true,
    products_count: 8,
  },
];

const mockProducts: ProductItem[] = [
  {
    id: "prod-201",
    name: "CortexLink Pro BCI Headband",
    slug: "cortexlink-pro-bci",
    sku: "CLP-01",
    base_price: 1899.0,
    sale_price: 1699.0,
    stock_quantity: 8,
    status: "active",
    is_active: true,
    is_featured: true,
    category: { id: "cat-1", name: "Neural Interface Headsets" },
    brand: { id: "br-1", name: "CortexDynamics" },
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "prod-202",
    name: "CortexSense Electrode Array",
    slug: "cortexsense-electrode-array",
    sku: "CSE-16",
    base_price: 499.0,
    sale_price: null,
    stock_quantity: 3,
    status: "active",
    is_active: true,
    is_featured: false,
    category: { id: "cat-2", name: "Biometric & Telemetry Sensors" },
    brand: { id: "br-1", name: "CortexDynamics" },
    created_at: "2026-08-02T00:00:00Z",
    updated_at: "2026-08-02T00:00:00Z",
  },
];

describe("STEP 28.2 — Storefront Brand Discovery & Brand Landing Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. BRAND DIRECTORY (/brands) TESTS
  // ---------------------------------------------------------------------------
  describe("Brand Directory (/brands)", () => {
    it("1. renders brand index page and semantic landmarks with single H1", () => {
      vi.mocked(useBrands).mockReturnValue({
        data: mockBrands,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<BrandsDirectoryPage />);

      const h1 = screen.getByRole("heading", { level: 1, name: /explore brands/i });
      expect(h1).toBeInTheDocument();
      expect(screen.getByText(/BRAND DIRECTORY/i)).toBeInTheDocument();
      expect(screen.getByText(/3 Manufacturers/i)).toBeInTheDocument();
    });

    it("2. renders accessible breadcrumb with correct hierarchy", () => {
      vi.mocked(useBrands).mockReturnValue({
        data: mockBrands,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<BrandsDirectoryPage />);

      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
      expect(screen.getByText("Brands")).toBeInTheDocument();
    });

    it("3. renders brand cards with authoritative initials, names, descriptions, and product counts", () => {
      vi.mocked(useBrands).mockReturnValue({
        data: mockBrands,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<BrandsDirectoryPage />);

      // Initials & Names
      expect(screen.getByText("CO")).toBeInTheDocument(); // CortexDynamics (single word -> first 2 chars)
      expect(screen.getByText("CortexDynamics")).toBeInTheDocument();
      expect(screen.getByText("NE")).toBeInTheDocument(); // NeuroPulse
      expect(screen.getByText("NeuroPulse")).toBeInTheDocument();
      expect(screen.getByText("SS")).toBeInTheDocument(); // Synaptic Systems
      expect(screen.getByText("Synaptic Systems")).toBeInTheDocument();

      // Descriptions
      expect(screen.getByText(/Advanced EEG neural interface hardware/i)).toBeInTheDocument();
      expect(screen.getByText(/Medical-grade EMG bio-amplifiers/i)).toBeInTheDocument();

      // Product counts
      expect(screen.getByText("28 Products")).toBeInTheDocument();
      expect(screen.getByText("15 Products")).toBeInTheDocument();
    });

    it("4. brand links preserve correct authoritative slugs", () => {
      vi.mocked(useBrands).mockReturnValue({
        data: mockBrands,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<BrandsDirectoryPage />);

      const link1 = screen.getByRole("link", { name: /cortexdynamics/i });
      expect(link1).toHaveAttribute("href", "/brand/cortex-dynamics");

      const link2 = screen.getByRole("link", { name: /neuropulse/i });
      expect(link2).toHaveAttribute("href", "/brand/neuropulse");
    });

    it("5. renders loading skeleton during brand fetching", () => {
      vi.mocked(useBrands).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      } as any);

      const { container } = render(<BrandsDirectoryPage />);

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThanOrEqual(8);
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    it("6. renders non-technical error state with retry action", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useBrands).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      } as any);

      render(<BrandsDirectoryPage />);

      expect(screen.getByText("Unable to load brands")).toBeInTheDocument();
      const retryBtn = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryBtn);
      expect(mockRefetch).toHaveBeenCalled();
    });

    it("7. renders empty state when brands array is empty", () => {
      vi.mocked(useBrands).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<BrandsDirectoryPage />);

      expect(screen.getByText("No Brands Available")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /browse products/i })).toHaveAttribute("href", "/products");
    });
  });

  // ---------------------------------------------------------------------------
  // 2. BRAND LANDING PAGE (/brand/[slug]) TESTS
  // ---------------------------------------------------------------------------
  describe("Brand Landing Page (/brand/[slug])", () => {
    it("8. renders brand detail page with single H1 and authoritative hero metadata", async () => {
      vi.mocked(useBrandBySlug).mockReturnValue({
        data: mockBrands[0],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.mocked(useBrandProducts).mockReturnValue({
        data: {
          data: mockProducts,
          meta: { current_page: 1, per_page: 12, total: 2, last_page: 1 },
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      await act(async () => {
        render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
      });

      // Exactly one H1
      const h1s = screen.getAllByRole("heading", { level: 1 });
      expect(h1s).toHaveLength(1);
      expect(h1s[0]).toHaveTextContent("CortexDynamics");

      // Eyebrow and Description
      expect(screen.getByText("MANUFACTURER / BRAND")).toBeInTheDocument();
      expect(screen.getByText(/Advanced EEG neural interface hardware/i)).toBeInTheDocument();
      expect(screen.getByText("2 Products")).toBeInTheDocument();

      // Official Website Link
      const websiteLink = screen.getByRole("link", { name: /official website/i });
      expect(websiteLink).toHaveAttribute("href", "https://cortexdynamics.example.com");
      expect(websiteLink).toHaveAttribute("target", "_blank");
    });

    it("9. renders breadcrumbs with Home → Brands → Brand Name", async () => {
      vi.mocked(useBrandBySlug).mockReturnValue({
        data: mockBrands[0],
        isLoading: false,
      } as any);

      vi.mocked(useBrandProducts).mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
      });

      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Brands" })).toHaveAttribute("href", "/brands");
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    });

    it("10. renders brand products reusing canonical ProductCard with pricing and stock states", async () => {
      vi.mocked(useBrandBySlug).mockReturnValue({
        data: mockBrands[0],
        isLoading: false,
      } as any);

      vi.mocked(useBrandProducts).mockReturnValue({
        data: {
          data: mockProducts,
          meta: { current_page: 1, per_page: 12, total: 2, last_page: 1 },
        },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
      });

      expect(screen.getByText("CortexLink Pro BCI Headband")).toBeInTheDocument();
      expect(screen.getByText("CortexSense Electrode Array")).toBeInTheDocument();
      expect(screen.getByText("$1,699.00")).toBeInTheDocument();
      expect(screen.getByText("Low Stock (3 left)")).toBeInTheDocument();
    });

    it("11. supports search within brand and updates query parameter", async () => {
      vi.mocked(useBrandBySlug).mockReturnValue({
        data: mockBrands[0],
        isLoading: false,
      } as any);

      const mockProductsQuery = vi.fn().mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      });
      vi.mocked(useBrandProducts).mockImplementation(mockProductsQuery);

      await act(async () => {
        render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
      });

      const searchInput = screen.getByPlaceholderText(/search products in cortexdynamics/i);
      fireEvent.change(searchInput, { target: { value: "Electrode" } });

      expect(mockProductsQuery).toHaveBeenCalledWith(
        "cortex-dynamics",
        expect.objectContaining({ search: "Electrode" })
      );
    });

    it("12. supports sorting transitions (newest, price_asc, price_desc, popular)", async () => {
      vi.mocked(useBrandBySlug).mockReturnValue({
        data: mockBrands[0],
        isLoading: false,
      } as any);

      const mockProductsQuery = vi.fn().mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      });
      vi.mocked(useBrandProducts).mockImplementation(mockProductsQuery);

      await act(async () => {
        render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
      });

      const sortSelect = screen.getByRole("combobox", { name: /sort products/i });
      fireEvent.change(sortSelect, { target: { value: "price_desc" } });

      expect(mockProductsQuery).toHaveBeenCalledWith(
        "cortex-dynamics",
        expect.objectContaining({ sort: "price_desc" })
      );
    });

    it("13. supports in-stock filter toggle and clear filters action", async () => {
      vi.mocked(useBrandBySlug).mockReturnValue({
        data: mockBrands[0],
        isLoading: false,
      } as any);

      const mockProductsQuery = vi.fn().mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      });
      vi.mocked(useBrandProducts).mockImplementation(mockProductsQuery);

      await act(async () => {
        render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
      });

      const inStockBtn = screen.getByRole("button", { name: /in stock only/i });
      fireEvent.click(inStockBtn);

      expect(mockProductsQuery).toHaveBeenCalledWith(
        "cortex-dynamics",
        expect.objectContaining({ in_stock: true })
      );

      // Clear button should be visible
      const clearBtn = screen.getByRole("button", { name: /clear/i });
      fireEvent.click(clearBtn);

      expect(mockProductsQuery).toHaveBeenCalledWith(
        "cortex-dynamics",
        expect.objectContaining({ in_stock: undefined, sort: "newest" })
      );
    });

    it("14. renders empty brand state when total products is zero (unfiltered)", async () => {
      vi.mocked(useBrandBySlug).mockReturnValue({
        data: mockBrands[0],
        isLoading: false,
      } as any);

      vi.mocked(useBrandProducts).mockReturnValue({
        data: { data: [], meta: { total: 0 } },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
      });

      expect(screen.getByText("No Products from This Brand")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /browse all products/i })).toHaveAttribute("href", "/products");
    });

    it("15. renders filtered empty state when filter/search yields zero products", async () => {
      vi.mocked(useBrandBySlug).mockReturnValue({
        data: mockBrands[0],
        isLoading: false,
      } as any);

      vi.mocked(useBrandProducts).mockReturnValue({
        data: { data: [], meta: { total: 0 } },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
      });

      // Activate search
      const searchInput = screen.getByPlaceholderText(/search products in cortexdynamics/i);
      fireEvent.change(searchInput, { target: { value: "Nonexistent" } });

      expect(screen.getByText("No Matching Products")).toBeInTheDocument();
    });

    it("16. renders loading skeletons for hero and product cards during load", async () => {
      vi.mocked(useBrandBySlug).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      vi.mocked(useBrandProducts).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      let container: HTMLElement;
      await act(async () => {
        const res = render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
        container = res.container;
      });

      const skeletons = container!.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThanOrEqual(8);
    });

    it("17. renders error state with retry button when query fails", async () => {
      const mockRefetchBrand = vi.fn();
      const mockRefetchProd = vi.fn();

      vi.mocked(useBrandBySlug).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetchBrand,
      } as any);

      vi.mocked(useBrandProducts).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetchProd,
      } as any);

      await act(async () => {
        render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
      });

      expect(screen.getByText("Unable to load brand")).toBeInTheDocument();
      const retryBtn = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryBtn);

      expect(mockRefetchBrand).toHaveBeenCalled();
      expect(mockRefetchProd).toHaveBeenCalled();
    });

    it("18. add to cart interaction works on brand product cards", async () => {
      const mockAddToCartMutate = vi.fn();
      vi.mocked(useAddToCart).mockReturnValue({
        mutate: mockAddToCartMutate,
        isPending: false,
      } as any);

      vi.mocked(useBrandBySlug).mockReturnValue({
        data: mockBrands[0],
        isLoading: false,
      } as any);

      vi.mocked(useBrandProducts).mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
      });

      const addButtons = screen.getAllByRole("button", { name: /add to cart/i });
      expect(addButtons.length).toBe(2);

      fireEvent.click(addButtons[0]);
      expect(mockAddToCartMutate).toHaveBeenCalledWith({
        productId: "prod-201",
        quantity: 1,
      });
    });

    it("19. wishlist button toggle functions on brand product cards", async () => {
      vi.mocked(useBrandBySlug).mockReturnValue({
        data: mockBrands[0],
        isLoading: false,
      } as any);

      vi.mocked(useBrandProducts).mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<BrandProductsPage params={Promise.resolve({ slug: "cortex-dynamics" })} />);
      });

      const wishlistButtons = screen.getAllByRole("button", { name: /add to wishlist/i });
      expect(wishlistButtons.length).toBe(2);

      fireEvent.click(wishlistButtons[0]);
      expect(screen.getByRole("button", { name: /remove from wishlist/i })).toBeInTheDocument();
    });
  });
});
