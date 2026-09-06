import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CustomerDashboardPage from "@/app/(portal)/account/page";
import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import {
  useCustomerProfile,
  useCustomerOrders,
  useCustomerWishlist,
  useCustomerAddresses,
  useCustomerUnreadCount,
} from "@/hooks/use-customer";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth-service";

vi.mock("@/hooks/use-customer", () => ({
  useCustomerProfile: vi.fn(),
  useCustomerOrders: vi.fn(),
  useCustomerWishlist: vi.fn(),
  useCustomerAddresses: vi.fn(),
  useCustomerUnreadCount: vi.fn(),
}));

vi.mock("@/services/auth-service", () => ({
  authService: {
    logout: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/account",
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockProfile = {
  id: "u-1",
  first_name: "Sarah",
  last_name: "Connor",
  email: "sarah@cyberdyne.lab",
};

const mockOrder = {
  id: "ord-1",
  order_number: "ORD-2026-0001",
  user_id: "u-1",
  status: "pending",
  status_label: "Pending",
  currency_code: "USD",
  total_amount: 549.99,
  item_count: 1,
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

describe("Customer Account Dashboard & Portal Shell Suite (STEP 26.6)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      user: mockProfile as any,
      token: "valid-token",
      isAuthenticated: true,
    });

    vi.mocked(useCustomerProfile).mockReturnValue({
      data: mockProfile,
      isLoading: false,
    } as any);

    vi.mocked(useCustomerOrders).mockReturnValue({
      data: { data: [mockOrder], meta: { current_page: 1, per_page: 5, total: 1, last_page: 1 } },
      isLoading: false,
    } as any);

    vi.mocked(useCustomerWishlist).mockReturnValue({
      data: {
        items: [
          {
            id: "w-1",
            product: { id: "p-1", name: "Neural Interface V2", slug: "neural-interface-v2", base_price: 549.99 },
          },
        ],
      },
      isLoading: false,
    } as any);

    vi.mocked(useCustomerAddresses).mockReturnValue({
      data: [
        {
          id: "addr-1",
          first_name: "Sarah",
          last_name: "Connor",
          company: "Cyberdyne Systems",
          address_line_1: "18144 El Camino Real",
          city: "Sunnyvale",
          state: "CA",
          postal_code: "94086",
          is_default: true,
        },
      ],
      isLoading: false,
    } as any);

    vi.mocked(useCustomerUnreadCount).mockReturnValue({
      data: 3,
      isLoading: false,
    } as any);
  });

  it("1. Welcome Banner & Customer Identity: renders welcome message and customer name", () => {
    render(<CustomerDashboardPage />);

    expect(screen.getByText(/Welcome back, Sarah/i)).toBeInTheDocument();
    expect(screen.getByText("CUSTOMER PORTAL")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edit profile/i })).toHaveAttribute("href", "/account/profile");
  });

  it("2. KPI Metric Cards: renders total orders, wishlist, addresses, and unread alerts", () => {
    render(<CustomerDashboardPage />);

    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Wishlist Items")).toBeInTheDocument();
    expect(screen.getByText("Saved Addresses")).toBeInTheDocument();
    expect(screen.getByText("Unread Alerts")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("3. Recent Orders: renders order number, status badge, and line total", () => {
    render(<CustomerDashboardPage />);

    expect(screen.getByText("Recent Laboratory Orders")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getAllByText("₦549.99").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("link", { name: /view details/i })).toHaveAttribute("href", "/account/orders/ord-1");
  });

  it("4. Empty Orders State: renders fallback when order list is empty", () => {
    vi.mocked(useCustomerOrders).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 5, total: 0, last_page: 1 } },
      isLoading: false,
    } as any);

    render(<CustomerDashboardPage />);

    expect(screen.getByText("No Orders Yet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse hardware/i })).toHaveAttribute("href", "/products");
  });

  it("5. Wishlist & Address Previews: renders saved items and default delivery address", () => {
    render(<CustomerDashboardPage />);

    expect(screen.getByText("Saved Wishlist")).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2")).toBeInTheDocument();
    expect(screen.getByText("Default Delivery Address")).toBeInTheDocument();
    expect(screen.getByText("18144 El Camino Real")).toBeInTheDocument();
  });

  it("6. Customer Sidebar: renders customer identity card, initials, navigation groups, and sign out", () => {
    render(<CustomerSidebar />);

    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText("SC")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
    expect(screen.getByText("Addresses")).toBeInTheDocument();
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    expect(signOutBtn).toBeInTheDocument();
  });
});
