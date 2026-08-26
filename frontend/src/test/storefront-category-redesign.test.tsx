import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CategoriesDirectoryPage from "@/app/(store)/categories/page";
import CategoryProductsPage from "@/app/(store)/category/[slug]/page";
import {
  useCategoriesTree,
  useCategoryBySlug,
  useCategoryProducts,
  useAddToCart,
  useToggleWishlist,
} from "@/hooks/use-storefront";
import { CategoryItem, ProductItem } from "@/services/catalog-service";

vi.mock("@/hooks/use-storefront", () => ({
  useCategoriesTree: vi.fn(),
  useCategoryBySlug: vi.fn(),
  useCategoryProducts: vi.fn(),
  useAddToCart: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useToggleWishlist: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

const mockCategories: CategoryItem[] = [
  {
    id: "cat-1",
    name: "Neural Interface Headsets",
    slug: "neural-interface-headsets",
    description: "High-density multi-channel EEG & BCI headsets with sub-millisecond latency.",
    is_active: true,
    products_count: 24,
  },
  {
    id: "cat-2",
    name: "Biometric & Telemetry Sensors",
    slug: "biometric-telemetry-sensors",
    description: "Medical-grade physiological telemetry, EMG electrodes, and micro-volt amplifiers.",
    is_active: true,
    products_count: 18,
  },
  {
    id: "cat-3",
    name: "Laboratory Instrumentation",
    slug: "laboratory-instrumentation",
    description: "Electrophysiology calibrators, Faraday enclosures, and digital signal processors.",
    is_active: true,
    products_count: 12,
  },
  {
    id: "cat-4",
    name: "Cables & Accessories",
    slug: "cables-accessories",
    description: "Shielded coax cables, gold-plated snap leads, and replacement headstraps.",
    is_active: true,
    products_count: 45,
  },
];

const mockProducts: ProductItem[] = [
  {
    id: "prod-101",
    name: "NeuroCap Elite 64-Channel EEG",
    slug: "neurocap-elite-64",
    sku: "NCE-64",
    base_price: 2499.0,
    sale_price: 2299.0,
    stock_quantity: 14,
    status: "active",
    is_active: true,
    is_featured: true,
    category: { id: "cat-1", name: "Neural Interface Headsets" },
    brand: { id: "br-1", name: "CortexDynamics" },
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "prod-102",
    name: "SynapseLink Wireless BCI Receiver",
    slug: "synapselink-wireless-bci",
    sku: "SLW-02",
    base_price: 899.0,
    sale_price: null,
    stock_quantity: 5,
    status: "active",
    is_active: true,
    is_featured: false,
    category: { id: "cat-1", name: "Neural Interface Headsets" },
    brand: { id: "br-2", name: "NeuroPulse" },
    created_at: "2026-08-02T00:00:00Z",
    updated_at: "2026-08-02T00:00:00Z",
  },
];

describe("STEP 28.1 — Storefront Category Discovery & Category Landing Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 1. CATEGORY DIRECTORY (/categories) TESTS
  // ---------------------------------------------------------------------------
  describe("Category Directory (/categories)", () => {
    it("1. renders category index page and semantic landmarks", () => {
      vi.mocked(useCategoriesTree).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<CategoriesDirectoryPage />);

      expect(screen.getByRole("heading", { level: 1, name: /explore categories/i })).toBeInTheDocument();
      expect(screen.getByText(/SHOP BY CATEGORY/i)).toBeInTheDocument();
      expect(screen.getByText(/4 Categories/i)).toBeInTheDocument();
    });

    it("2. renders accessible breadcrumb with correct hierarchy", () => {
      vi.mocked(useCategoriesTree).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<CategoriesDirectoryPage />);

      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
      expect(screen.getByText("Categories")).toBeInTheDocument();
    });

    it("3. renders category cards with authoritative names, descriptions, and product counts", () => {
      vi.mocked(useCategoriesTree).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<CategoriesDirectoryPage />);

      // Names
      expect(screen.getByText("Neural Interface Headsets")).toBeInTheDocument();
      expect(screen.getByText("Biometric & Telemetry Sensors")).toBeInTheDocument();
      expect(screen.getByText("Laboratory Instrumentation")).toBeInTheDocument();
      expect(screen.getByText("Cables & Accessories")).toBeInTheDocument();

      // Descriptions
      expect(screen.getByText(/High-density multi-channel EEG/i)).toBeInTheDocument();
      expect(screen.getByText(/Medical-grade physiological telemetry/i)).toBeInTheDocument();

      // Product counts
      expect(screen.getByText(/24/i)).toBeInTheDocument();
      expect(screen.getByText(/18/i)).toBeInTheDocument();
    });

    it("4. category links preserve correct authoritative slugs", () => {
      vi.mocked(useCategoriesTree).mockReturnValue({
        data: mockCategories,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<CategoriesDirectoryPage />);

      const link1 = screen.getByRole("link", { name: /neural interface headsets/i });
      expect(link1).toHaveAttribute("href", "/category/neural-interface-headsets");

      const link2 = screen.getByRole("link", { name: /biometric & telemetry sensors/i });
      expect(link2).toHaveAttribute("href", "/category/biometric-telemetry-sensors");
    });

    it("5. renders loading skeleton during category fetching", () => {
      vi.mocked(useCategoriesTree).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: vi.fn(),
      } as any);

      const { container } = render(<CategoriesDirectoryPage />);

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThanOrEqual(8);
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    it("6. renders non-technical error state with retry action", () => {
      const mockRefetch = vi.fn();
      vi.mocked(useCategoriesTree).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      } as any);

      render(<CategoriesDirectoryPage />);

      expect(screen.getByText("Unable to load categories")).toBeInTheDocument();
      const retryBtn = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryBtn);
      expect(mockRefetch).toHaveBeenCalled();
    });

    it("7. renders empty state when categories array is empty", () => {
      vi.mocked(useCategoriesTree).mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<CategoriesDirectoryPage />);

      expect(screen.getByText("No Categories Available")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /browse all products/i })).toHaveAttribute("href", "/products");
    });
  });

  // ---------------------------------------------------------------------------
  // 2. CATEGORY LANDING PAGE (/category/[slug]) TESTS
  // ---------------------------------------------------------------------------
  describe("Category Landing Page (/category/[slug])", () => {
    it("8. renders category detail page with single H1 and authoritative hero metadata", async () => {
      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: mockCategories[0],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.mocked(useCategoryProducts).mockReturnValue({
        data: {
          data: mockProducts,
          meta: { current_page: 1, per_page: 12, total: 2, last_page: 1 },
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      await act(async () => {
        render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
      });

      // Exactly one H1
      const h1s = screen.getAllByRole("heading", { level: 1 });
      expect(h1s).toHaveLength(1);
      expect(h1s[0]).toHaveTextContent("Neural Interface Headsets");

      // Eyebrow and Description
      expect(screen.getByText("CATEGORY")).toBeInTheDocument();
      expect(screen.getByText(/High-density multi-channel EEG & BCI headsets/i)).toBeInTheDocument();
      expect(screen.getByText("2 Products")).toBeInTheDocument();
    });

    it("9. renders breadcrumbs with Home → Categories → Category Name", async () => {
      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: mockCategories[0],
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      vi.mocked(useCategoryProducts).mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
      });

      const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
      expect(nav).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Categories" })).toHaveAttribute("href", "/categories");
      expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    });

    it("10. renders category products reusing existing ProductCard with pricing and stock states", async () => {
      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: mockCategories[0],
        isLoading: false,
      } as any);

      vi.mocked(useCategoryProducts).mockReturnValue({
        data: {
          data: mockProducts,
          meta: { current_page: 1, per_page: 12, total: 2, last_page: 1 },
        },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
      });

      expect(screen.getByText("NeuroCap Elite 64-Channel EEG")).toBeInTheDocument();
      expect(screen.getByText("SynapseLink Wireless BCI Receiver")).toBeInTheDocument();
      expect(screen.getByText("$2,299.00")).toBeInTheDocument();
      expect(screen.getByText("Low Stock (5 left)")).toBeInTheDocument();
    });

    it("11. supports search within category and updates query parameter", async () => {
      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: mockCategories[0],
        isLoading: false,
      } as any);

      const mockProductsQuery = vi.fn().mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      });
      vi.mocked(useCategoryProducts).mockImplementation(mockProductsQuery);

      await act(async () => {
        render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
      });

      const searchInput = screen.getByPlaceholderText(/search in this category/i);
      fireEvent.change(searchInput, { target: { value: "Wireless" } });

      expect(mockProductsQuery).toHaveBeenCalledWith(
        "neural-interface-headsets",
        expect.objectContaining({ search: "Wireless" })
      );
    });

    it("12. supports sorting transitions (newest, price_asc, price_desc, popular)", async () => {
      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: mockCategories[0],
        isLoading: false,
      } as any);

      const mockProductsQuery = vi.fn().mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      });
      vi.mocked(useCategoryProducts).mockImplementation(mockProductsQuery);

      await act(async () => {
        render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
      });

      const sortSelect = screen.getByRole("combobox", { name: /sort products/i });
      fireEvent.change(sortSelect, { target: { value: "price_asc" } });

      expect(mockProductsQuery).toHaveBeenCalledWith(
        "neural-interface-headsets",
        expect.objectContaining({ sort: "price_asc" })
      );
    });

    it("13. supports in-stock filter toggle and clear filters action", async () => {
      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: mockCategories[0],
        isLoading: false,
      } as any);

      const mockProductsQuery = vi.fn().mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      });
      vi.mocked(useCategoryProducts).mockImplementation(mockProductsQuery);

      await act(async () => {
        render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
      });

      const inStockBtn = screen.getByRole("button", { name: /in stock only/i });
      fireEvent.click(inStockBtn);

      expect(mockProductsQuery).toHaveBeenCalledWith(
        "neural-interface-headsets",
        expect.objectContaining({ in_stock: true })
      );

      // Clear button should be visible
      const clearBtn = screen.getByRole("button", { name: /clear/i });
      fireEvent.click(clearBtn);

      expect(mockProductsQuery).toHaveBeenCalledWith(
        "neural-interface-headsets",
        expect.objectContaining({ in_stock: undefined, sort: "newest" })
      );
    });

    it("14. renders empty category state when total products is zero (unfiltered)", async () => {
      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: mockCategories[0],
        isLoading: false,
      } as any);

      vi.mocked(useCategoryProducts).mockReturnValue({
        data: { data: [], meta: { total: 0 } },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
      });

      expect(screen.getByText("No Products in This Category")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /browse all products/i })).toHaveAttribute("href", "/products");
    });

    it("15. renders filtered empty state when filter/search yields zero products", async () => {
      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: mockCategories[0],
        isLoading: false,
      } as any);

      vi.mocked(useCategoryProducts).mockReturnValue({
        data: { data: [], meta: { total: 0 } },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
      });

      // Activate search
      const searchInput = screen.getByPlaceholderText(/search in this category/i);
      fireEvent.change(searchInput, { target: { value: "Nonexistent" } });

      expect(screen.getByText("No Matching Products")).toBeInTheDocument();
    });

    it("16. renders loading skeletons for hero and product cards during load", async () => {
      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      vi.mocked(useCategoryProducts).mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      let container: HTMLElement;
      await act(async () => {
        const res = render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
        container = res.container;
      });

      const skeletons = container!.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThanOrEqual(8);
    });

    it("17. renders error state with retry button when query fails", async () => {
      const mockRefetchCat = vi.fn();
      const mockRefetchProd = vi.fn();

      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetchCat,
      } as any);

      vi.mocked(useCategoryProducts).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetchProd,
      } as any);

      await act(async () => {
        render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
      });

      expect(screen.getByText("Unable to load category")).toBeInTheDocument();
      const retryBtn = screen.getByRole("button", { name: /retry/i });
      fireEvent.click(retryBtn);

      expect(mockRefetchCat).toHaveBeenCalled();
      expect(mockRefetchProd).toHaveBeenCalled();
    });

    it("18. add to cart interaction works on category product cards", async () => {
      const mockAddToCartMutate = vi.fn();
      vi.mocked(useAddToCart).mockReturnValue({
        mutate: mockAddToCartMutate,
        isPending: false,
      } as any);

      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: mockCategories[0],
        isLoading: false,
      } as any);

      vi.mocked(useCategoryProducts).mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
      });

      const addButtons = screen.getAllByRole("button", { name: /add to cart/i });
      expect(addButtons.length).toBe(2);

      fireEvent.click(addButtons[0]);
      expect(mockAddToCartMutate).toHaveBeenCalledWith({
        productId: "prod-101",
        quantity: 1,
      });
    });

    it("19. wishlist button toggle functions on category product cards", async () => {
      vi.mocked(useCategoryBySlug).mockReturnValue({
        data: mockCategories[0],
        isLoading: false,
      } as any);

      vi.mocked(useCategoryProducts).mockReturnValue({
        data: { data: mockProducts, meta: { total: 2 } },
        isLoading: false,
      } as any);

      await act(async () => {
        render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-interface-headsets" })} />);
      });

      const wishlistButtons = screen.getAllByRole("button", { name: /add to wishlist/i });
      expect(wishlistButtons.length).toBe(2);

      fireEvent.click(wishlistButtons[0]);
      expect(screen.getByRole("button", { name: /remove from wishlist/i })).toBeInTheDocument();
    });
  });
});
