import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import StorefrontSearchPage from "@/app/(store)/search/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import * as storefrontHooks from "@/hooks/use-storefront";

// Mock router and search params
let mockSearchParams = new URLSearchParams("q=headset&category=wearables&sort=newest&page=1");
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/search",
  useSearchParams: () => mockSearchParams,
}));

// Authoritative Mock Data matching Laravel response
const mockSearchResults = [
  {
    id: "prod-uuid-001",
    name: "NeuroFit Sense Smart Health Watch",
    slug: "neurofit-sense-smart-health-watch",
    sku: "NFS-HW-001",
    short_description: "Real-time biometric monitoring.",
    base_price: 185000,
    compare_at_price: 210000,
    currency_code: "NGN",
    is_featured: true,
    is_active: true,
    stock_status: "in_stock",
    stock_quantity: 42,
    avg_rating: 4.9,
    review_count: 36,
    category: {
      id: "cat-1",
      name: "Smart Wearables",
      slug: "smart-wearables",
    },
    brand: {
      id: "brd-1",
      name: "NeuroFit",
      slug: "neurofit",
    },
    primary_image: {
      id: "img-1",
      url: "https://api.neurocommerce.ai/storage/products/watch.webp",
      alt_text: "NeuroFit Watch Image",
    },
  },
  {
    id: "prod-uuid-002",
    name: "AcousticLab Neural Audio Interface",
    slug: "acousticlab-neural-audio-interface",
    sku: "ACL-AUD-002",
    short_description: "Spatial EEG audio headset.",
    base_price: 295000,
    compare_at_price: null,
    currency_code: "NGN",
    is_featured: false,
    is_active: true,
    stock_status: "in_stock",
    stock_quantity: 18,
    avg_rating: 4.7,
    review_count: 14,
    category: {
      id: "cat-2",
      name: "Audio Equipment",
      slug: "audio-equipment",
    },
    brand: {
      id: "brd-2",
      name: "AcousticLab",
      slug: "acousticlab",
    },
    primary_image: {
      id: "img-2",
      url: "https://api.neurocommerce.ai/storage/products/headset.webp",
      alt_text: "AcousticLab Headset Image",
    },
  },
];

const mockCategoriesTree = [
  { id: "cat-1", name: "Smart Wearables", slug: "smart-wearables" },
  { id: "cat-2", name: "Audio Equipment", slug: "audio-equipment" },
];

const mockBrandsList = [
  { id: "brd-1", name: "NeuroFit", slug: "neurofit" },
  { id: "brd-2", name: "AcousticLab", slug: "acousticlab" },
];

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe("Storefront Product Search, Discovery & Merchandising (STEP 28.27)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams("q=headset&category=smart-wearables&sort=newest&page=1");

    vi.spyOn(storefrontHooks, "useSearchProducts").mockReturnValue({
      data: {
        data: mockSearchResults,
        meta: { current_page: 1, last_page: 3, per_page: 12, total: 34 },
      },
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(storefrontHooks, "useCategoriesTree").mockReturnValue({
      data: mockCategoriesTree,
      isLoading: false,
    } as any);

    vi.spyOn(storefrontHooks, "useBrands").mockReturnValue({
      data: mockBrandsList,
      isLoading: false,
    } as any);

    vi.spyOn(storefrontHooks, "useAddToCart").mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it("1. Search page renders breadcrumbs, title, and search input", () => {
    renderWithClient(<StorefrontSearchPage />);

    expect(screen.getByText("Product Search & Discovery")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search neural headsets/i)).toBeInTheDocument();
    expect(screen.getByText(/Results for/i)).toBeInTheDocument();
    expect(screen.getByText("Found 34 matching specifications")).toBeInTheDocument();
  });

  it("2. Search input handles typing and submits search update to URL", async () => {
    renderWithClient(<StorefrontSearchPage />);

    const searchInput = screen.getByPlaceholderText(/Search neural headsets/i);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: "smart watch" } });
    });

    const submitBtn = screen.getByRole("button", { name: "Search" });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("q=smart+watch"));
  });

  it("3. Clear button resets search input", async () => {
    renderWithClient(<StorefrontSearchPage />);

    const clearBtn = screen.getByLabelText(/Clear search input/i);
    await act(async () => {
      fireEvent.click(clearBtn);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("page=1"));
  });

  it("4. Renders real product results with images, names, and categories", () => {
    renderWithClient(<StorefrontSearchPage />);

    expect(screen.getByText("NeuroFit Sense Smart Health Watch")).toBeInTheDocument();
    expect(screen.getByText("AcousticLab Neural Audio Interface")).toBeInTheDocument();
    expect(screen.getAllByText("Smart Wearables").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Audio Equipment").length).toBeGreaterThanOrEqual(1);
  });

  it("5. Renders Category and Brand facet filtering sidebar", () => {
    renderWithClient(<StorefrontSearchPage />);

    expect(screen.getAllByText("Filter Catalog").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: /Smart Wearables/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: /Audio Equipment/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: /NeuroFit/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: /AcousticLab/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("6. Clicking a category facet updates category filter in URL", async () => {
    renderWithClient(<StorefrontSearchPage />);

    const audioCategoryBtns = screen.getAllByRole("button", { name: /Audio Equipment/i });
    await act(async () => {
      fireEvent.click(audioCategoryBtns[0]);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("category=audio-equipment"));
  });

  it("7. Clicking a brand facet updates brand filter in URL", async () => {
    renderWithClient(<StorefrontSearchPage />);

    const brandBtns = screen.getAllByRole("button", { name: /AcousticLab/i });
    await act(async () => {
      fireEvent.click(brandBtns[0]);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("brand=acousticlab"));
  });

  it("8. Sort dropdown updates sort parameter in URL", async () => {
    renderWithClient(<StorefrontSearchPage />);

    const sortSelect = screen.getByLabelText(/Sort products by/i);
    await act(async () => {
      fireEvent.change(sortSelect, { target: { value: "price_asc" } });
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("sort=price_asc"));
  });

  it("9. In-stock toggle updates in_stock parameter in URL", async () => {
    renderWithClient(<StorefrontSearchPage />);

    const inStockCheckboxes = screen.getAllByRole("checkbox", { name: /In Stock Only/i });
    await act(async () => {
      fireEvent.click(inStockCheckboxes[0]);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("in_stock=true"));
  });

  it("10. Renders empty search results state when zero products return", () => {
    vi.spyOn(storefrontHooks, "useSearchProducts").mockReturnValue({
      data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 12, total: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    renderWithClient(<StorefrontSearchPage />);

    expect(screen.getByText("No matching products found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Browse Full Catalog/i })).toBeInTheDocument();
  });

  it("11. Renders error state with retry button when query fails", () => {
    const mockRefetch = vi.fn();
    vi.spyOn(storefrontHooks, "useSearchProducts").mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    renderWithClient(<StorefrontSearchPage />);

    expect(screen.getByText("Search Service Unavailable")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /Retry Query/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("12. Renders pagination controls for multi-page search results", () => {
    renderWithClient(<StorefrontSearchPage />);

    expect(
      screen.getAllByText((_, el) => el?.textContent?.replace(/\s+/g, " ").trim() === "Page 1 of 3").length
    ).toBeGreaterThanOrEqual(1);
  });
});
