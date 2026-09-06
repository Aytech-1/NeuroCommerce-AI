import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import CategoryProductsPage from "@/app/(store)/category/[slug]/page";
import SearchPage from "@/app/(store)/search/page";
import {
  useCategoryBySlug,
  useCategoryProducts,
  useSearchProducts,
} from "@/hooks/use-storefront";
import { ProductItem } from "@/services/catalog-service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/search",
  useSearchParams: () => ({
    get: (key: string) => (key === "q" ? "EEG" : null),
  }),
}));

vi.mock("@/hooks/use-storefront", () => ({
  useCategoryBySlug: vi.fn(),
  useCategoryProducts: vi.fn(),
  useSearchProducts: vi.fn(),
  useCategoriesTree: vi.fn(() => ({ data: [] })),
  useBrands: vi.fn(() => ({ data: [] })),
  useAddToCart: vi.fn(() => ({ mutate: vi.fn() })),
}));

const mockProduct: ProductItem = {
  id: "prod-2",
  name: "Synaptic Cortex Adapter",
  slug: "synaptic-cortex-adapter",
  sku: "SCA-01",
  base_price: 299.99,
  status: "active",
  is_active: true,
  is_featured: false,
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

describe("Storefront Category & Search Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders category products page with category metadata", async () => {
    vi.mocked(useCategoryBySlug).mockReturnValue({
      data: { id: "cat-1", name: "Neural Sensors", slug: "neural-sensors", description: "Precision electrodes", is_active: true },
      isLoading: false,
    } as any);

    vi.mocked(useCategoryProducts).mockReturnValue({
      data: { data: [mockProduct], meta: { current_page: 1, per_page: 12, total: 1, last_page: 1 } },
      isLoading: false,
    } as any);

    await act(async () => {
      render(<CategoryProductsPage params={Promise.resolve({ slug: "neural-sensors" })} />);
    });

    expect(screen.getByRole("heading", { name: "Neural Sensors" })).toBeInTheDocument();
    expect(screen.getByText("Precision electrodes")).toBeInTheDocument();
    expect(screen.getByText("Synaptic Cortex Adapter")).toBeInTheDocument();
  });

  it("renders search results page with active query indicator", async () => {
    vi.mocked(useSearchProducts).mockReturnValue({
      data: { data: [mockProduct], meta: { current_page: 1, per_page: 12, total: 1, last_page: 1 } },
      isLoading: false,
      isError: false,
    } as any);

    await act(async () => {
      render(<SearchPage />);
    });

    expect(screen.getByText(/Results for/i)).toBeInTheDocument();
    expect(screen.getByText(/EEG/i)).toBeInTheDocument();
    expect(screen.getByText("Synaptic Cortex Adapter")).toBeInTheDocument();
  });
});
