import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductInventoryManager } from "@/components/admin/product-inventory-manager";
import * as useInventoryModule from "@/hooks/use-inventory";
import { InventoryItem, Warehouse } from "@/services/inventory-service";

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

describe("Admin Product Inventory Management UI (ProductInventoryManager)", () => {
  const mockProductId = "prod-uuid-101";
  const mockProductSku = "NHP-GEN-100";
  const mockWarehouses: Warehouse[] = [
    {
      id: "wh-los-1",
      name: "Main Lagos Hub",
      code: "WH-LOS-01",
      is_active: true,
      is_default: true,
      priority: 0,
    },
    {
      id: "wh-abj-2",
      name: "Abuja Regional Depot",
      code: "WH-ABJ-02",
      is_active: true,
      is_default: false,
      priority: 1,
    },
  ];

  const mockInventoryItems: InventoryItem[] = [
    {
      id: "inv-1",
      product_id: mockProductId,
      variant_id: null,
      warehouse_id: "wh-los-1",
      warehouse: mockWarehouses[0],
      quantity_on_hand: 50,
      quantity_reserved: 5,
      quantity_available: 45,
      reorder_point: 10,
      reorder_quantity: 50,
      is_low_stock: false,
      is_out_of_stock: false,
      movements: [
        {
          id: "mov-1",
          inventory_item_id: "inv-1",
          movement_type: "receipt",
          quantity: 50,
          notes: "Initial supplier shipment",
          created_at: "2026-08-20T10:00:00Z",
        },
      ],
    },
    {
      id: "inv-2",
      product_id: mockProductId,
      variant_id: "var-gold-1",
      variant: {
        id: "var-gold-1",
        name: "Gold Edition",
        sku: "NHP-GOLD-64",
      },
      warehouse_id: "wh-abj-2",
      warehouse: mockWarehouses[1],
      quantity_on_hand: 8,
      quantity_reserved: 2,
      quantity_available: 6,
      reorder_point: 10,
      reorder_quantity: 20,
      is_low_stock: true,
      is_out_of_stock: false,
      movements: [],
    },
  ];

  const mockAdjustMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useInventoryModule, "useProductInventory").mockReturnValue({
      data: { data: mockInventoryItems, meta: { total: 2 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(useInventoryModule, "useWarehouses").mockReturnValue({
      data: mockWarehouses,
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(useInventoryModule, "useAdjustStock").mockReturnValue({
      mutateAsync: mockAdjustMutateAsync,
      isPending: false,
    } as any);
  });

  it("1. renders inventory distribution table with warehouse hubs, on-hand, reserved, and available quantities", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <ProductInventoryManager
          productId={mockProductId}
          productSku={mockProductSku}
        />
      </Wrapper>
    );

    expect(screen.getByText("Inventory & Warehouses")).toBeInTheDocument();
    expect(screen.getByText("Main Lagos Hub")).toBeInTheDocument();
    expect(screen.getByText("WH-LOS-01")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("Optimal Stock")).toBeInTheDocument();

    expect(screen.getByText("Abuja Regional Depot")).toBeInTheDocument();
    expect(screen.getByText("WH-ABJ-02")).toBeInTheDocument();
    expect(screen.getByText("Variant SKU: NHP-GOLD-64")).toBeInTheDocument();
    expect(screen.getByText("Low Stock (≤10)")).toBeInTheDocument();
  });

  it("2. renders clean empty state when no inventory items exist for product", () => {
    const { Wrapper } = createWrapper();
    vi.spyOn(useInventoryModule, "useProductInventory").mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    } as any);

    render(
      <Wrapper>
        <ProductInventoryManager
          productId={mockProductId}
          productSku={mockProductSku}
        />
      </Wrapper>
    );

    expect(screen.getByText("No Warehouse Inventory Initialized")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /initialize warehouse stock/i })).toBeInTheDocument();
  });

  it("3. opens adjust stock modal and dispatches adjust mutation on submit", async () => {
    const { Wrapper } = createWrapper();
    mockAdjustMutateAsync.mockResolvedValueOnce({ data: mockInventoryItems[0] });

    render(
      <Wrapper>
        <ProductInventoryManager
          productId={mockProductId}
          productSku={mockProductSku}
        />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: "Adjust Stock" }));

    expect(screen.getByText("Adjust Warehouse Inventory")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/quantity delta \(units\) \*/i), {
      target: { value: "25" },
    });
    fireEvent.change(screen.getByLabelText(/reason \/ reference notes/i), {
      target: { value: "Supplier shipment PO-9921" },
    });

    const submitBtn = screen.getByRole("button", { name: "Submit Adjustment" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockAdjustMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: mockProductId,
          warehouse_id: "wh-los-1",
          quantity_delta: 25,
          movement_type: "adjustment",
          notes: "Supplier shipment PO-9921",
        })
      );
    });
  });

  it("4. handles negative quantity deductions and variant selection", async () => {
    const { Wrapper } = createWrapper();
    mockAdjustMutateAsync.mockResolvedValueOnce({ data: mockInventoryItems[1] });

    render(
      <Wrapper>
        <ProductInventoryManager
          productId={mockProductId}
          productSku={mockProductSku}
          variants={[
            {
              id: "var-gold-1",
              sku: "NHP-GOLD-64",
              name: "Gold Edition",
              is_active: true,
            },
          ]}
        />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: "Adjust Stock" }));

    fireEvent.change(screen.getByLabelText(/target sku \/ option/i), {
      target: { value: "var-gold-1" },
    });
    fireEvent.change(screen.getByLabelText(/quantity delta \(units\) \*/i), {
      target: { value: "-5" },
    });

    const submitBtn = screen.getByRole("button", { name: "Submit Adjustment" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockAdjustMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: mockProductId,
          variant_id: "var-gold-1",
          quantity_delta: -5,
        })
      );
    });
  });

  it("5. displays backend business rule error when stock reduction violates constraints", async () => {
    const { Wrapper } = createWrapper();
    mockAdjustMutateAsync.mockRejectedValueOnce({
      message: "Physical quantity cannot be reduced below reserved quantity (5).",
    });

    render(
      <Wrapper>
        <ProductInventoryManager
          productId={mockProductId}
          productSku={mockProductSku}
        />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: "Adjust Stock" }));

    fireEvent.change(screen.getByLabelText(/quantity delta \(units\) \*/i), {
      target: { value: "-100" },
    });

    const submitBtn = screen.getByRole("button", { name: "Submit Adjustment" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Physical quantity cannot be reduced below reserved quantity (5)."
      );
    });
  });

  it("6. toggles stock movement audit history on click", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <ProductInventoryManager
          productId={mockProductId}
          productSku={mockProductSku}
        />
      </Wrapper>
    );

    const toggleBtn = screen.getByLabelText("Toggle stock history");
    fireEvent.click(toggleBtn);

    expect(screen.getByText("Recent Stock Movements for Selected Hub")).toBeInTheDocument();
    expect(screen.getByText("(Initial supplier shipment)")).toBeInTheDocument();
    expect(screen.getByText("+50 units")).toBeInTheDocument();
  });
});
