import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import CustomerOrderDetailPage from "@/app/(portal)/account/orders/[id]/page";
import { useCustomerOrder, useCancelCustomerOrder } from "@/hooks/use-customer";
import { OrderDetail } from "@/services/order-service";

vi.mock("@/hooks/use-customer", () => ({
  useCustomerOrder: vi.fn(),
  useCancelCustomerOrder: vi.fn(),
}));

const mockOrder: OrderDetail = {
  id: "ord-1",
  order_number: "ORD-2026-0001",
  status: "pending",
  status_label: "Pending",
  currency_code: "USD",
  subtotal: 549.99,
  discount_amount: 0,
  tax_amount: 44.0,
  shipping_amount: 15.0,
  total_amount: 608.99,
  item_count: 1,
  payment_method: "Credit Card",
  shipping_method: "FedEx Laboratory Express",
  notes: null,
  user: {
    id: "u-1",
    first_name: "Sarah",
    last_name: "Connor",
    email: "sarah@cyberdyne.lab",
  },
  shipping_address: {
    first_name: "Sarah",
    last_name: "Connor",
    address_line_1: "18144 El Camino Real",
    city: "Sunnyvale",
    state: "CA",
    postal_code: "94086",
    country_code: "US",
  },
  billing_address: {
    first_name: "Sarah",
    last_name: "Connor",
    address_line_1: "18144 El Camino Real",
    city: "Sunnyvale",
    state: "CA",
    postal_code: "94086",
    country_code: "US",
  },
  items: [
    {
      id: "oi-1",
      order_id: "ord-1",
      product_id: "prod-1",
      product_name: "Neural Interface V2 Pro",
      sku: "NIV2-PRO",
      unit_price: 549.99,
      quantity: 1,
      total_price: 549.99,
    },
  ],
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

describe("Customer Order Detail & Fulfillment Suite (STEP 26.9)", () => {
  const mockCancelMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCustomerOrder).mockReturnValue({
      data: mockOrder,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useCancelCustomerOrder).mockReturnValue({
      mutate: mockCancelMutate,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders order number, status badge, and breadcrumb links", async () => {
    await act(async () => {
      render(<CustomerOrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    expect(screen.getByText("My Account")).toBeInTheDocument();
    expect(screen.getByText("Order History")).toBeInTheDocument();
    expect(screen.getByText("Order ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /print receipt/i })).toBeInTheDocument();
  });

  it("2. Fulfillment Timeline: renders the multi-step lifecycle stepper", async () => {
    await act(async () => {
      render(<CustomerOrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    expect(screen.getByText("FULFILLMENT STATUS")).toBeInTheDocument();
    expect(screen.getByText("Order Placed")).toBeInTheDocument();
    expect(screen.getByText("Payment Confirmed")).toBeInTheDocument();
    expect(screen.getByText("Processing & QA")).toBeInTheDocument();
    expect(screen.getByText("Dispatched")).toBeInTheDocument();
    expect(screen.getByText("Delivered")).toBeInTheDocument();
  });

  it("3. Order Line Items: renders purchased hardware with SKU, Qty, and price", async () => {
    await act(async () => {
      render(<CustomerOrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    expect(screen.getByText("Items in Your Order (1)")).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText(/SKU: NIV2-PRO/i)).toBeInTheDocument();
    expect(screen.getByText(/Qty: 1/i)).toBeInTheDocument();
  });

  it("4. Financial Breakdown & Delivery: renders subtotal, tax, shipping, and total", async () => {
    await act(async () => {
      render(<CustomerOrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    expect(screen.getByText("Financial Breakdown")).toBeInTheDocument();
    expect(screen.getAllByText("$549.99").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("$608.99")).toBeInTheDocument();
    expect(screen.getByText("18144 El Camino Real")).toBeInTheDocument();
  });

  it("5. Cancel Order Flow: opens dialog and triggers cancel mutation", async () => {
    await act(async () => {
      render(<CustomerOrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    const cancelBtn = screen.getByRole("button", { name: /cancel order/i });
    fireEvent.click(cancelBtn);

    expect(screen.getByText(/Cancel Order ORD-2026-0001/i)).toBeInTheDocument();

    const reasonInput = screen.getByPlaceholderText(/reason for cancellation/i);
    fireEvent.change(reasonInput, { target: { value: "Lab protocol changed" } });

    const confirmBtn = screen.getByRole("button", { name: /confirm cancellation/i });
    fireEvent.click(confirmBtn);

    expect(mockCancelMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "ord-1",
        reason: "Lab protocol changed",
      }),
      expect.anything()
    );
  });

  it("6. Cancelled Order State: renders dedicated cancelled hero banner", async () => {
    vi.mocked(useCustomerOrder).mockReturnValue({
      data: { ...mockOrder, status: "cancelled", status_label: "Cancelled" },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    await act(async () => {
      render(<CustomerOrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    expect(screen.getByText("Order Cancelled")).toBeInTheDocument();
    expect(screen.getByText(/This order was cancelled and is no longer being processed/i)).toBeInTheDocument();
  });
});
