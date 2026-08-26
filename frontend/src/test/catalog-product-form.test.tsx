import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateProductPage from "@/app/(admin)/admin/products/create/page";
import { catalogService } from "@/services/catalog-service";
import { useCategories, useBrands } from "@/hooks/use-catalog";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/services/catalog-service", () => ({
  catalogService: {
    createProduct: vi.fn(),
  },
}));

vi.mock("@/hooks/use-catalog", () => ({
  useCategories: vi.fn(),
  useBrands: vi.fn(),
}));

describe("Admin Product Creation Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCategories).mockReturnValue({
      data: [{ id: "cat-1", name: "Audio", slug: "audio", is_active: true }],
      isLoading: false,
    } as any);

    vi.mocked(useBrands).mockReturnValue({
      data: [{ id: "br-1", name: "NeuroTech", slug: "neurotech", is_active: true }],
      isLoading: false,
    } as any);
  });

  it("renders form fields for name, SKU, price, and descriptions", () => {
    render(<CreateProductPage />);

    expect(screen.getByLabelText(/product name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sku \(stock keeping unit\) \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/base price \(\$\) \*/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save product/i })).toBeInTheDocument();
  });

  it("validates required fields on empty submit", async () => {
    render(<CreateProductPage />);

    fireEvent.click(screen.getByRole("button", { name: /save product/i }));

    await waitFor(() => {
      expect(screen.getByText(/product name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/sku is required/i)).toBeInTheDocument();
    });
  });

  it("submits valid product payload and redirects to product detail", async () => {
    vi.mocked(catalogService.createProduct).mockResolvedValueOnce({
      id: "prod-new-123",
      name: "Smart Headset Gen 2",
      slug: "smart-headset-gen-2",
      sku: "SHG2-001",
      base_price: 349.99,
      status: "active",
      is_active: true,
      is_featured: false,
      created_at: "2026-08-21T00:00:00Z",
      updated_at: "2026-08-21T00:00:00Z",
    });

    render(<CreateProductPage />);

    fireEvent.change(screen.getByLabelText(/product name \*/i), {
      target: { value: "Smart Headset Gen 2" },
    });
    fireEvent.change(screen.getByLabelText(/sku \(stock keeping unit\) \*/i), {
      target: { value: "SHG2-001" },
    });
    fireEvent.change(screen.getByLabelText(/base price \(\$\) \*/i), {
      target: { value: "349.99" },
    });

    fireEvent.click(screen.getByRole("button", { name: /save product/i }));

    await waitFor(() => {
      expect(catalogService.createProduct).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/admin/products/prod-new-123");
    });
  });
});
