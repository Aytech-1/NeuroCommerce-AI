import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CustomerOrdersPage from "@/app/(portal)/account/orders/page";
import { useCustomerOrders } from "@/hooks/use-customer";
import { OrderListItem } from "@/services/order-service";

vi.mock("@/hooks/use-customer", () => ({
  useCustomerOrders: vi.fn(),
}));

const mockOrder1: OrderListItem = {
  id: "ord-1",
  order_number: "ORD-2026-0001",
  user_id: "u-1",
  status: "delivered",
  status_label: "Delivered",
  currency_code: "USD",
  total_amount: 549.99,
  item_count: 2,
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

const mockOrder2: OrderListItem = {
  id: "ord-2",
  order_number: "ORD-2026-0002",
  user_id: "u-1",
  status: "processing",
  status_label: "Processing",
  currency_code: "USD",
  total_amount: 1250.0,
  item_count: 1,
  created_at: "2026-08-22T00:00:00Z",
  updated_at: "2026-08-22T00:00:00Z",
};

describe("Customer Order History & Management Suite (STEP 26.8)", () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCustomerOrders).mockReturnValue({
      data: {
        data: [mockOrder1, mockOrder2],
        meta: { current_page: 1, per_page: 10, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);
  });

  it("1. Order History Header & Summary Stats: renders breadcrumbs, title, eyebrow, and quick metric cards", () => {
    render(<CustomerOrdersPage />);

    // Breadcrumbs
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /my account/i })).toHaveAttribute("href", "/account");

    // Header & CTAs
    expect(screen.getByText("YOUR ORDERS")).toBeInTheDocument();
    expect(screen.getByText("Order History")).toBeInTheDocument();
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Active Orders")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();

    const continueShoppingLinks = screen.getAllByRole("link", { name: /continue shopping/i });
    expect(continueShoppingLinks[0]).toHaveAttribute("href", "/products");
  });

  it("2. Order List & Items: renders order cards with order number, status, and line total", () => {
    render(<CustomerOrdersPage />);

    expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0002")).toBeInTheDocument();
    expect(screen.getAllByText("Delivered").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Processing").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("₦549.99")).toBeInTheDocument();
    expect(screen.getByText("₦1,250.00")).toBeInTheDocument();

    const viewOrderLinks = screen.getAllByRole("link", { name: /view order/i });
    expect(viewOrderLinks.length).toBe(2);
    expect(viewOrderLinks[0]).toHaveAttribute("href", "/account/orders/ord-2");
    expect(viewOrderLinks[1]).toHaveAttribute("href", "/account/orders/ord-1");
  });

  it("3. Search Filter: filters orders by order number query", () => {
    render(<CustomerOrdersPage />);

    const searchInput = screen.getByPlaceholderText(/search by order #/i);
    fireEvent.change(searchInput, { target: { value: "0002" } });

    expect(screen.queryByText("ORD-2026-0001")).not.toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0002")).toBeInTheDocument();
  });

  it("4. Search Empty State: displays dedicated search empty state with clear filters button", () => {
    render(<CustomerOrdersPage />);

    const searchInput = screen.getByPlaceholderText(/search by order #/i);
    fireEvent.change(searchInput, { target: { value: "NONEXISTENT-999" } });

    expect(screen.getByText("No orders found")).toBeInTheDocument();
    expect(screen.getByText(/try a different order number or clear your filters/i)).toBeInTheDocument();

    const clearBtn = screen.getByRole("button", { name: /clear search & filters/i });
    fireEvent.click(clearBtn);

    expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0002")).toBeInTheDocument();
  });

  it("5. Empty Orders State: renders fallback when order list is empty", () => {
    vi.mocked(useCustomerOrders).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 10, total: 0, last_page: 1 } },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CustomerOrdersPage />);

    expect(screen.getByText("No orders yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore products/i })).toHaveAttribute("href", "/products");
  });

  it("6. Error State: displays error card and triggers retry", () => {
    vi.mocked(useCustomerOrders).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<CustomerOrdersPage />);

    expect(screen.getByText("Unable to load your orders")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalled();
  });
});
