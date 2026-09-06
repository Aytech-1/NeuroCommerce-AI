import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductVariantManager } from "@/components/admin/product-variant-manager";
import { ProductVariant } from "@/services/catalog-service";
import * as useCatalogModule from "@/hooks/use-catalog";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, Wrapper };
}

describe("Admin Product Variant Management UI (ProductVariantManager)", () => {
  const mockProductId = "prod-uuid-101";
  const mockBasePrice = 120000;
  const mockVariants: ProductVariant[] = [
    {
      id: "var-1",
      sku: "NHP-GOLD-64",
      name: "Gold Edition / 64GB",
      price: 135000,
      compare_at_price: 150000,
      is_active: true,
      barcode: "890123456789",
      sort_order: 0,
    },
    {
      id: "var-2",
      sku: "NHP-SILVER-128",
      name: "Silver Edition / 128GB",
      price: null, // Uses base price
      compare_at_price: null,
      is_active: false,
      sort_order: 1,
    },
  ];

  const mockCreateMutateAsync = vi.fn();
  const mockUpdateMutateAsync = vi.fn();
  const mockDeleteMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useCatalogModule, "useCreateVariant").mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    } as any);

    vi.spyOn(useCatalogModule, "useUpdateVariant").mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false,
    } as any);

    vi.spyOn(useCatalogModule, "useDeleteVariant").mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    } as any);
  });

  it("1. renders existing variants with name, SKU, formatted ₦ prices, and status badges", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <ProductVariantManager
          productId={mockProductId}
          basePrice={mockBasePrice}
          existingVariants={mockVariants}
        />
      </Wrapper>
    );

    expect(screen.getByText("Product Variants")).toBeInTheDocument();
    expect(screen.getByText("Gold Edition / 64GB")).toBeInTheDocument();
    expect(screen.getByText("SKU: NHP-GOLD-64")).toBeInTheDocument();
    expect(screen.getByText("₦135,000.00")).toBeInTheDocument();
    expect(screen.getByText("₦150,000.00")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    expect(screen.getByText("Silver Edition / 128GB")).toBeInTheDocument();
    expect(screen.getByText("SKU: NHP-SILVER-128")).toBeInTheDocument();
    expect(screen.getByText("₦120,000.00")).toBeInTheDocument();
    expect(screen.getByText("(Base product price)")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("2. renders clean empty state when no variants are configured", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <ProductVariantManager
          productId={mockProductId}
          basePrice={mockBasePrice}
          existingVariants={[]}
        />
      </Wrapper>
    );

    expect(screen.getByText("No SKU Variants Added")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add first variant/i })).toBeInTheDocument();
  });

  it("3. opens create modal and validates required SKU on empty submit", async () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <ProductVariantManager
          productId={mockProductId}
          basePrice={mockBasePrice}
          existingVariants={mockVariants}
        />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: /add variant/i }));

    expect(screen.getByText("Create New Product Variant")).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: "Create Variant" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Variant SKU is required")).toBeInTheDocument();
    });
    expect(mockCreateMutateAsync).not.toHaveBeenCalled();
  });

  it("4. submits valid variant creation payload and dispatches create mutation", async () => {
    const { Wrapper } = createWrapper();
    mockCreateMutateAsync.mockResolvedValueOnce({ id: "var-new" });

    render(
      <Wrapper>
        <ProductVariantManager
          productId={mockProductId}
          basePrice={mockBasePrice}
          existingVariants={mockVariants}
        />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: /add variant/i }));

    fireEvent.change(screen.getByLabelText(/variant name/i), {
      target: { value: "Rose Gold / 256GB" },
    });
    fireEvent.change(screen.getByLabelText(/variant sku \*/i), {
      target: { value: "NHP-RG-256" },
    });
    fireEvent.change(screen.getByLabelText(/price \(₦\)/i), {
      target: { value: "145000" },
    });

    const submitBtn = screen.getByRole("button", { name: "Create Variant" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sku: "NHP-RG-256",
          name: "Rose Gold / 256GB",
          price: 145000,
          is_active: true,
        })
      );
    });
  });

  it("5. opens edit modal prefilled with existing variant data and dispatches update mutation", async () => {
    const { Wrapper } = createWrapper();
    mockUpdateMutateAsync.mockResolvedValueOnce({ id: "var-1" });

    render(
      <Wrapper>
        <ProductVariantManager
          productId={mockProductId}
          basePrice={mockBasePrice}
          existingVariants={mockVariants}
        />
      </Wrapper>
    );

    const editBtn = screen.getByLabelText("Edit variant NHP-GOLD-64");
    fireEvent.click(editBtn);

    expect(screen.getByText("Edit Product Variant")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Gold Edition / 64GB")).toBeInTheDocument();
    expect(screen.getByDisplayValue("NHP-GOLD-64")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/price \(₦\)/i), {
      target: { value: "140000" },
    });

    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        variantId: "var-1",
        data: expect.objectContaining({
          sku: "NHP-GOLD-64",
          price: 140000,
        }),
      });
    });
  });

  it("6. opens delete confirmation dialog and dispatches delete mutation upon confirmation", async () => {
    const { Wrapper } = createWrapper();
    mockDeleteMutateAsync.mockResolvedValueOnce(null);

    render(
      <Wrapper>
        <ProductVariantManager
          productId={mockProductId}
          basePrice={mockBasePrice}
          existingVariants={mockVariants}
        />
      </Wrapper>
    );

    const deleteBtn = screen.getByLabelText("Delete variant NHP-GOLD-64");
    fireEvent.click(deleteBtn);

    expect(screen.getByText("Delete Product Variant")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete variant "Gold Edition \/ 64GB"/)
    ).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Delete Variant" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith("var-1");
    });
  });

  it("7. handles duplicate SKU backend error and displays inline alert message", async () => {
    const { Wrapper } = createWrapper();
    mockCreateMutateAsync.mockRejectedValueOnce({
      message: "The sku has already been taken.",
      errors: {
        sku: ["The sku has already been taken."],
      },
    });

    render(
      <Wrapper>
        <ProductVariantManager
          productId={mockProductId}
          basePrice={mockBasePrice}
          existingVariants={mockVariants}
        />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: /add variant/i }));

    fireEvent.change(screen.getByLabelText(/variant sku \*/i), {
      target: { value: "NHP-GOLD-64" },
    });

    const submitBtn = screen.getByRole("button", { name: "Create Variant" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("The sku has already been taken.");
    });
  });
});
