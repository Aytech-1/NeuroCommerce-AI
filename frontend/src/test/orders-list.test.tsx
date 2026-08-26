import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminOrdersPage from "@/app/(admin)/admin/orders/page";
import { useOrders } from "@/hooks/use-orders";
import { OrderListItem } from "@/services/order-service";

vi.mock("@/hooks/use-orders", () => ({
  useOrders: vi.fn(),
}));

const mockOrders: OrderListItem[] = [
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
];

describe("Admin Orders List Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders order table with orders from backend response", () => {
    vi.mocked(useOrders).mockReturnValue({
      data: {
        data: mockOrders,
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminOrdersPage />);

    expect(screen.getByText("ORD-2026-1001")).toBeInTheDocument();
    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText("sarah@example.com")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
    expect(screen.getByText("$549.99")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /processing/i })).toBeInTheDocument();
  });

  it("renders empty state when no orders exist", () => {
    vi.mocked(useOrders).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 15, total: 0 } },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminOrdersPage />);

    expect(screen.getByText(/no orders found/i)).toBeInTheDocument();
  });

  it("updates search input on change", () => {
    vi.mocked(useOrders).mockReturnValue({
      data: { data: mockOrders, meta: { current_page: 1, per_page: 15, total: 1 } },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminOrdersPage />);

    const searchInput = screen.getByPlaceholderText(/search by order #/i);
    fireEvent.change(searchInput, { target: { value: "ORD-2026" } });

    expect(searchInput).toHaveValue("ORD-2026");
  });
});
