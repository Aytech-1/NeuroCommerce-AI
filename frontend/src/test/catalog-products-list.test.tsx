import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminProductsPage from "@/app/(admin)/admin/products/page";
import { useProducts, useCategories, useDeleteProduct, useUpdateProductStatus } from "@/hooks/use-catalog";
import { ProductItem } from "@/services/catalog-service";

vi.mock("@/hooks/use-catalog", () => ({
  useProducts: vi.fn(),
  useCategories: vi.fn(),
  useDeleteProduct: vi.fn(),
  useUpdateProductStatus: vi.fn(),
}));

const mockProducts: ProductItem[] = [
  {
    id: "prod-1",
    name: "Neural Headset Alpha",
    slug: "neural-headset-alpha",
    sku: "NHA-001",
    base_price: 299.99,
    status: "active",
    is_active: true,
    is_featured: true,
    category: { id: "cat-1", name: "Audio" },
    brand: { id: "br-1", name: "NeuroTech" },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-21T00:00:00Z",
  },
];

describe("Admin Catalog Products Page", () => {
  const mockDeleteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCategories).mockReturnValue({
      data: [{ id: "cat-1", name: "Audio", slug: "audio", is_active: true }],
      isLoading: false,
    } as any);

    vi.mocked(useDeleteProduct).mockReturnValue({
      mutateAsync: mockDeleteMutate,
      isPending: false,
    } as any);

    vi.mocked(useUpdateProductStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("renders product table with products from backend response", () => {
    vi.mocked(useProducts).mockReturnValue({
      data: {
        data: mockProducts,
        meta: { current_page: 1, per_page: 15, total: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminProductsPage />);

    expect(screen.getByText("Neural Headset Alpha")).toBeInTheDocument();
    expect(screen.getByText("NHA-001")).toBeInTheDocument();
    expect(screen.getByText("₦299.99")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Audio" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /active/i })).toBeInTheDocument();
  });

  it("renders empty state when no products exist", () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 15, total: 0 } },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminProductsPage />);

    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  it("triggers search and updates search input", () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { data: mockProducts, meta: { current_page: 1, per_page: 15, total: 1 } },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminProductsPage />);

    const searchInput = screen.getByPlaceholderText(/search by name, sku, or slug/i);
    fireEvent.change(searchInput, { target: { value: "headset" } });

    expect(searchInput).toHaveValue("headset");
  });
});
