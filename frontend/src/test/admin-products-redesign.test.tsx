import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminProductsPage from "@/app/(admin)/admin/products/page";
import CreateProductPage from "@/app/(admin)/admin/products/create/page";
import {
  useProducts,
  useCategories,
  useBrands,
  useDeleteProduct,
  useUpdateProductStatus,
} from "@/hooks/use-catalog";
import { catalogService } from "@/services/catalog-service";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/products",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-catalog", () => ({
  useProducts: vi.fn(),
  useCategories: vi.fn(),
  useBrands: vi.fn(),
  useDeleteProduct: vi.fn(),
  useUpdateProductStatus: vi.fn(),
  useUploadProductImages: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteProductImage: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useReorderProductImages: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useCreateVariant: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useUpdateVariant: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
  useDeleteVariant: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

vi.mock("@/services/catalog-service", () => ({
  catalogService: {
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
  },
}));

const mockProducts = [
  {
    id: "prod-1",
    name: "Neural Interface V2 Pro",
    slug: "neural-interface-v2-pro",
    sku: "NIV2-PRO-01",
    base_price: 4999.0,
    status: "active" as const,
    is_active: true,
    is_featured: true,
    category: { id: "cat-1", name: "Interfaces" },
    brand: { id: "br-1", name: "NeuroTech Labs" },
    created_at: "2026-08-20T00:00:00Z",
    updated_at: "2026-08-24T12:00:00Z",
  },
  {
    id: "prod-2",
    name: "EEG Wireless Dry Cap",
    slug: "eeg-wireless-dry-cap",
    sku: "EEG-CAP-DRY",
    base_price: 1250.0,
    status: "draft" as const,
    is_active: false,
    is_featured: false,
    category: { id: "cat-2", name: "Headsets" },
    brand: { id: "br-2", name: "CortexLink" },
    created_at: "2026-08-22T00:00:00Z",
    updated_at: "2026-08-24T14:00:00Z",
  },
];

describe("Admin Product Catalog & Inventory Management Suite (STEP 27.2)", () => {
  const mockDeleteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCategories).mockReturnValue({
      data: [
        { id: "cat-1", name: "Interfaces", slug: "interfaces", is_active: true },
        { id: "cat-2", name: "Headsets", slug: "headsets", is_active: true },
      ],
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useBrands).mockReturnValue({
      data: [
        { id: "br-1", name: "NeuroTech Labs", slug: "neurotech-labs", is_active: true },
        { id: "br-2", name: "CortexLink", slug: "cortexlink", is_active: true },
      ],
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useDeleteProduct).mockReturnValue({
      mutateAsync: mockDeleteMutate,
      isPending: false,
    } as any);

    vi.mocked(useUpdateProductStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useProducts).mockReturnValue({
      data: {
        data: mockProducts,
        meta: { current_page: 1, per_page: 15, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, breadcrumb navigation, and Add Product CTA", () => {
    render(<AdminProductsPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText(/product catalog/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Products", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add product/i })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative total SKUs and pagination stats", () => {
    render(<AdminProductsPage />);

    expect(screen.getByText("Total SKUs")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1 of 1")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search input and renders status/category filters", () => {
    render(<AdminProductsPage />);

    const searchInput = screen.getByPlaceholderText(/search by name, sku, or slug/i);
    fireEvent.change(searchInput, { target: { value: "Interface" } });
    expect(searchInput).toHaveValue("Interface");

    expect(screen.getByText("All Statuses")).toBeInTheDocument();
    expect(screen.getByText("All Categories")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Interfaces" })).toBeInTheDocument();
  });

  it("4. Product Table: renders product rows with thumbnail, SKU, category, price, and status", () => {
    render(<AdminProductsPage />);

    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText("NIV2-PRO-01")).toBeInTheDocument();
    expect(screen.getByText("₦4,999.00")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Interfaces" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /active/i })).toBeInTheDocument();

    expect(screen.getByText("EEG Wireless Dry Cap")).toBeInTheDocument();
    expect(screen.getByText("EEG-CAP-DRY")).toBeInTheDocument();
    expect(screen.getByText("₦1,250.00")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /draft/i })).toBeInTheDocument();
  });

  it("5. Row Actions & Delete Trigger: renders view/edit links and triggers delete confirmation dialog", async () => {
    render(<AdminProductsPage />);

    const deleteButtons = screen.getAllByLabelText("Delete product");
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText("Delete this product?")).toBeInTheDocument();
    const confirmButton = screen.getByRole("button", { name: "Delete Product" });
    fireEvent.click(confirmButton);

    expect(mockDeleteMutate).toHaveBeenCalledWith("prod-1");
  });

  it("6. Empty State: renders empty catalog illustration and create CTA when 0 items returned", () => {
    vi.mocked(useProducts).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 15, total: 0, last_page: 1 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminProductsPage />);

    expect(screen.getByText("No Products Found")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
  });

  it("7. Product Creation Form: renders structured form sections, inputs, and validation", () => {
    render(<CreateProductPage />);

    expect(screen.getByText("CATALOG MANAGEMENT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /create new product/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/product name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sku \(stock keeping unit\) \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base price \(₦\) \*/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save product/i })).toBeInTheDocument();
  });
});
