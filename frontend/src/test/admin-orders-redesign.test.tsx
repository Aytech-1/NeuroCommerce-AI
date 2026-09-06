import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AdminOrdersPage from "@/app/(admin)/admin/orders/page";
import OrderDetailPage from "@/app/(admin)/admin/orders/[id]/page";
import {
  useOrders,
  useOrder,
  useOrderTimeline,
  useUpdateOrderStatus,
  useAddOrderNotes,
} from "@/hooks/use-orders";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/orders",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-orders", () => ({
  useOrders: vi.fn(),
  useOrder: vi.fn(),
  useOrderTimeline: vi.fn(),
  useUpdateOrderStatus: vi.fn(),
  useAddOrderNotes: vi.fn(),
}));

const mockOrdersList = [
  {
    id: "ord-1",
    order_number: "ORD-2026-1001",
    status: "processing",
    status_label: "Processing",
    currency_code: "USD",
    total_amount: 549.99,
    item_count: 2,
    user: {
      id: "u1",
      first_name: "Sarah",
      last_name: "Connor",
      email: "sarah@example.com",
    },
    created_at: "2026-08-22T10:00:00Z",
    updated_at: "2026-08-22T10:05:00Z",
  },
  {
    id: "ord-2",
    order_number: "ORD-2026-1002",
    status: "delivered",
    status_label: "Delivered",
    currency_code: "USD",
    total_amount: 1250.0,
    item_count: 1,
    user: {
      id: "u2",
      first_name: "Miles",
      last_name: "Dyson",
      email: "miles@cyberdyne.tech",
    },
    created_at: "2026-08-23T14:00:00Z",
    updated_at: "2026-08-24T09:00:00Z",
  },
];

const mockOrderDetail = {
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
  item_count: 2,
  shipping_method: "Express Laboratory Freight",
  admin_notes: "Requires chilled transport container.",
  user: {
    id: "u1",
    first_name: "Sarah",
    last_name: "Connor",
    email: "sarah@example.com",
  },
  shipping_address: {
    address_line_1: "123 Cyber Way",
    address_line_2: "Suite 400",
    city: "Los Angeles",
    state: "CA",
    postal_code: "90001",
    country_code: "US",
  },
  items: [
    {
      id: "item-1",
      order_id: "ord-1",
      product_name: "Neural Interface V2 Pro",
      sku: "NIV2-PRO-01",
      unit_price: 500,
      quantity: 1,
      total_price: 500,
    },
  ],
  created_at: "2026-08-22T10:00:00Z",
  updated_at: "2026-08-22T10:05:00Z",
};

describe("Admin Orders & Fulfillment Management Suite (STEP 27.5)", () => {
  const mockUpdateStatus = vi.fn();
  const mockAddNotes = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useOrders).mockReturnValue({
      data: {
        data: mockOrdersList,
        meta: { current_page: 1, per_page: 15, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useOrder).mockReturnValue({
      data: mockOrderDetail,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useOrderTimeline).mockReturnValue({
      data: [
        {
          id: "tl-1",
          from_status: "pending",
          to_status: "paid",
          comment: "Payment verified via Stripe",
          changed_by: { id: "staff-1", first_name: "Admin", last_name: "User" },
          created_at: "2026-08-22T10:05:00Z",
        },
      ],
      isLoading: false,
    } as any);

    vi.mocked(useUpdateOrderStatus).mockReturnValue({
      mutateAsync: mockUpdateStatus,
      isPending: false,
    } as any);

    vi.mocked(useAddOrderNotes).mockReturnValue({
      mutateAsync: mockAddNotes,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and breadcrumb navigation", () => {
    render(<AdminOrdersPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("Orders & Fulfillment")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Orders", level: 1 })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative total orders, in processing, and delivered stats", () => {
    render(<AdminOrdersPage />);

    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("2 Orders")).toBeInTheDocument();
    expect(screen.getByText("In Processing")).toBeInTheDocument();
    expect(screen.getByText("1 Processing")).toBeInTheDocument();
    expect(screen.getByText("Fulfillment Complete")).toBeInTheDocument();
    expect(screen.getByText("1 Delivered")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search query and renders status filter", () => {
    render(<AdminOrdersPage />);

    const searchInput = screen.getByPlaceholderText(/search by order #, email, or customer/i);
    fireEvent.change(searchInput, { target: { value: "ORD-2026" } });
    expect(searchInput).toHaveValue("ORD-2026");

    expect(screen.getByText("All Statuses")).toBeInTheDocument();
  });

  it("4. Orders Table: renders rows with order number, customer name, items, total, and status", () => {
    render(<AdminOrdersPage />);

    expect(screen.getByText("ORD-2026-1001")).toBeInTheDocument();
    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText("sarah@example.com")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
    expect(screen.getByText("₦549.99")).toBeInTheDocument();

    expect(screen.getByText("ORD-2026-1002")).toBeInTheDocument();
    expect(screen.getByText("Miles Dyson")).toBeInTheDocument();
    expect(screen.getByText("₦1,250.00")).toBeInTheDocument();
  });

  it("5. Order Detail Inspection: renders line items, financial summary, and customer delivery", async () => {
    await act(async () => {
      render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    expect(screen.getByText("ORDER DETAILS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ORD-2026-1001", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText(/NIV2-PRO-01/i)).toBeInTheDocument();
    expect(screen.getByText("Financial Breakdown")).toBeInTheDocument();
    expect(screen.getByText("₦510.00")).toBeInTheDocument();
    expect(screen.getByText("123 Cyber Way")).toBeInTheDocument();
    expect(screen.getByText("Express Laboratory Freight")).toBeInTheDocument();
  });

  it("6. Order Lifecycle Timeline & Admin Notes: renders audit trail and handles notes mutation", async () => {
    await act(async () => {
      render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    expect(screen.getByText("Order Lifecycle Timeline")).toBeInTheDocument();
    expect(screen.getByText(/"Payment verified via Stripe"/i)).toBeInTheDocument();
    expect(screen.getByText(/By: Admin User/i)).toBeInTheDocument();

    expect(screen.getByText("Requires chilled transport container.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const textarea = screen.getByPlaceholderText(/private staff notes/i);
    fireEvent.change(textarea, { target: { value: "Priority shipment confirmed." } });

    fireEvent.click(screen.getByRole("button", { name: /save note/i }));

    expect(mockAddNotes).toHaveBeenCalledWith({
      id: "ord-1",
      notes: "Priority shipment confirmed.",
    });
  });

  it("7. Status Update Modal Dialog: opens dialog and submits status transition", async () => {
    await act(async () => {
      render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    fireEvent.click(screen.getByRole("button", { name: /update status/i }));

    expect(screen.getByText(/transition order ord-2026-1001 to a new lifecycle state/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^update status$/i }));

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalled();
    });
  });

  it("8. Empty State: renders empty queue notice when 0 orders exist", () => {
    vi.mocked(useOrders).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 15, total: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminOrdersPage />);

    expect(screen.getByText("No Orders Found")).toBeInTheDocument();
  });
});
