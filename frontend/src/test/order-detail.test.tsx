import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import OrderDetailPage from "@/app/(admin)/admin/orders/[id]/page";
import { useOrder, useOrderTimeline, useUpdateOrderStatus, useAddOrderNotes } from "@/hooks/use-orders";
import { OrderDetail } from "@/services/order-service";

vi.mock("@/hooks/use-orders", () => ({
  useOrder: vi.fn(),
  useOrderTimeline: vi.fn(),
  useUpdateOrderStatus: vi.fn(),
  useAddOrderNotes: vi.fn(),
}));

const mockDetail: OrderDetail = {
  id: "ord-1",
  order_number: "ORD-2026-1001",
  status: "paid",
  status_label: "Paid",
  currency_code: "USD",
  subtotal: 500,
  discount_amount: 50,
  tax_amount: 40,
  shipping_amount: 20,
  total_amount: 510,
  item_count: 1,
  shipping_method: "Express Shipping",
  user: {
    id: "u1",
    first_name: "Sarah",
    last_name: "Connor",
    email: "sarah@example.com",
  },
  shipping_address: {
    address_line_1: "123 Cyber Way",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90001",
    country_code: "US",
  },
  items: [
    {
      id: "item-1",
      order_id: "ord-1",
      product_name: "Neural Interface V2",
      sku: "NIV2-01",
      unit_price: 500,
      quantity: 1,
      total_price: 500,
    },
  ],
  created_at: "2026-08-22T10:00:00Z",
  updated_at: "2026-08-22T10:05:00Z",
};

describe("Admin Order Detail Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateOrderStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useAddOrderNotes).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useOrderTimeline).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
  });

  it("renders order detail header, customer info, and financial breakdown", async () => {
    vi.mocked(useOrder).mockReturnValue({
      data: mockDetail,
      isLoading: false,
      isError: false,
    } as any);

    await act(async () => {
      render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    expect(await screen.findByText("ORD-2026-1001")).toBeInTheDocument();
    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText("123 Cyber Way")).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2")).toBeInTheDocument();
    expect(screen.getByText(/NIV2-01/i)).toBeInTheDocument();
    expect(screen.getAllByText("₦500.00").length).toBeGreaterThan(0);
    expect(screen.getByText("₦510.00")).toBeInTheDocument();
    expect(screen.getByText("Express Shipping")).toBeInTheDocument();
  });
});
