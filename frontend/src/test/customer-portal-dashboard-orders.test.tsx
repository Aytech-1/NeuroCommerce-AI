import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import CustomerDashboardPage from "@/app/(portal)/account/page";
import CustomerOrdersPage from "@/app/(portal)/account/orders/page";
import CustomerOrderDetailPage from "@/app/(portal)/account/orders/[id]/page";
import {
  useCustomerProfile,
  useCustomerOrders,
  useCustomerOrder,
  useCustomerWishlist,
  useCustomerAddresses,
  useCustomerUnreadCount,
  useCancelCustomerOrder,
} from "@/hooks/use-customer";
import { OrderListItem, OrderDetail } from "@/services/order-service";

vi.mock("@/hooks/use-customer", () => ({
  useCustomerProfile: vi.fn(),
  useCustomerOrders: vi.fn(),
  useCustomerOrder: vi.fn(),
  useCustomerWishlist: vi.fn(),
  useCustomerAddresses: vi.fn(),
  useCustomerUnreadCount: vi.fn(),
  useCancelCustomerOrder: vi.fn(),
}));

const mockOrderListItem: OrderListItem = {
  id: "ord-1",
  order_number: "ORD-2026-0001",
  user_id: "u-1",
  status: "pending",
  status_label: "Pending",
  currency_code: "USD",
  total_amount: 549.99,
  item_count: 1,
  user: {
    id: "u-1",
    first_name: "Sarah",
    last_name: "Connor",
    email: "sarah@cyberdyne.lab",
  },
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

const mockOrderDetail: OrderDetail = {
  id: "ord-1",
  order_number: "ORD-2026-0001",
  status: "pending",
  status_label: "Pending",
  currency_code: "USD",
  subtotal: 549.99,
  discount_amount: 0,
  tax_amount: 0,
  shipping_amount: 0,
  total_amount: 549.99,
  item_count: 1,
  payment_method: "Credit Card",
  shipping_method: "USPS Express",
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
    address_line_1: "77 Massachusetts Ave",
    city: "Cambridge",
    state: "MA",
    postal_code: "02139",
    country_code: "US",
  },
  billing_address: {
    first_name: "Sarah",
    last_name: "Connor",
    address_line_1: "77 Massachusetts Ave",
    city: "Cambridge",
    state: "MA",
    postal_code: "02139",
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

describe("Customer Portal Dashboard & Orders Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCustomerProfile).mockReturnValue({
      data: { id: "u-1", first_name: "Sarah", last_name: "Connor", email: "sarah@cyberdyne.lab" } as any,
      isLoading: false,
    } as any);

    vi.mocked(useCustomerWishlist).mockReturnValue({
      data: { items: [] },
      isLoading: false,
    } as any);

    vi.mocked(useCustomerAddresses).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    vi.mocked(useCustomerUnreadCount).mockReturnValue({
      data: 2,
      isLoading: false,
    } as any);

    vi.mocked(useCancelCustomerOrder).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it("renders customer account dashboard with greeting and metric cards", () => {
    vi.mocked(useCustomerOrders).mockReturnValue({
      data: { data: [mockOrderListItem], meta: { current_page: 1, per_page: 5, total: 1, last_page: 1 } },
      isLoading: false,
    } as any);

    render(<CustomerDashboardPage />);

    expect(screen.getByText(/Welcome back, Sarah/i)).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
  });

  it("renders customer orders history list page", () => {
    vi.mocked(useCustomerOrders).mockReturnValue({
      data: { data: [mockOrderListItem], meta: { current_page: 1, per_page: 10, total: 1, last_page: 1 } },
      isLoading: false,
      isError: false,
    } as any);

    render(<CustomerOrdersPage />);

    expect(screen.getByText("Order History")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("$549.99")).toBeInTheDocument();
  });

  it("renders customer order detail inspection page with line items", async () => {
    vi.mocked(useCustomerOrder).mockReturnValue({
      data: mockOrderDetail,
      isLoading: false,
      isError: false,
    } as any);

    await act(async () => {
      render(<CustomerOrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    expect(screen.getByText("Order ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText("Cancel Order")).toBeInTheDocument();
  });
});
