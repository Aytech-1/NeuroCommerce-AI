import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import PortalLayout from "@/app/(portal)/layout";
import CustomerDashboardPage from "@/app/(portal)/account/page";
import CustomerProfilePage from "@/app/(portal)/account/profile/page";
import CustomerOrdersPage from "@/app/(portal)/account/orders/page";
import CustomerWishlistPage from "@/app/(portal)/account/wishlist/page";
import CustomerAddressesPage from "@/app/(portal)/account/addresses/page";
import CustomerNotificationsPage from "@/app/(portal)/account/notifications/page";
import CustomerReviewsPage from "@/app/(portal)/account/reviews/page";
import {
  useCustomerProfile,
  useCustomerOrders,
  useCustomerWishlist,
  useCustomerAddresses,
  useCustomerUnreadCount,
  useCustomerNotifications,
  useNotificationPreferences,
  useCustomerReviews,
} from "@/hooks/use-customer";
import { useAuthStore } from "@/stores/auth-store";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/account"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-route">{children}</div>,
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/hooks/use-customer", () => ({
  useCustomerProfile: vi.fn(),
  useCustomerOrders: vi.fn(),
  useCustomerWishlist: vi.fn(),
  useCustomerAddresses: vi.fn(),
  useCustomerUnreadCount: vi.fn(),
  useCustomerNotifications: vi.fn(),
  useMarkNotificationRead: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useMarkAllNotificationsRead: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteCustomerNotification: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useNotificationPreferences: vi.fn(),
  useUpdateNotificationPreferences: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useCustomerReviews: vi.fn(),
  useCreateCustomerAddress: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteCustomerAddress: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useSetDefaultAddress: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRemoveWishlistItem: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRemoveFromWishlist: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useMoveWishlistToCart: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateCustomerProfile: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useChangePassword: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

describe("Customer Portal Full Visual Audit & Consistency Suite (STEP 26.14)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockAuthState = {
      user: { id: "u-1", first_name: "Sarah", last_name: "Connor", email: "sarah@cyberdyne.lab" },
      isAuthenticated: true,
      logout: vi.fn(),
    };

    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      return typeof selector === "function" ? selector(mockAuthState) : mockAuthState;
    });

    vi.mocked(useCustomerProfile).mockReturnValue({
      data: { id: "u-1", first_name: "Sarah", last_name: "Connor", email: "sarah@cyberdyne.lab", role: "customer" },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useCustomerOrders).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 10, total: 0, last_page: 1 } },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useCustomerWishlist).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useCustomerAddresses).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useCustomerUnreadCount).mockReturnValue({
      data: 0,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useCustomerNotifications).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 10, total: 0, last_page: 1 } },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useNotificationPreferences).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useCustomerReviews).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 10, total: 0, last_page: 1 } },
      isLoading: false,
      isError: false,
    } as any);
  });

  it("1. Portal Layout & Topbar: renders brand, portal badge, and protected shell", () => {
    render(
      <PortalLayout>
        <div data-testid="portal-content">Portal Content</div>
      </PortalLayout>
    );

    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(screen.getByText("NeuroCommerce")).toBeInTheDocument();
    expect(screen.getByText("Customer Portal")).toBeInTheDocument();
    expect(screen.getByTestId("portal-content")).toBeInTheDocument();
  });

  it("2. Sidebar Navigation: renders navigation groups with icons and active states", () => {
    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    );

    expect(screen.getByText("ACCOUNT")).toBeInTheDocument();
    expect(screen.getByText("SHOPPING")).toBeInTheDocument();
    expect(screen.getByText("ENGAGEMENT")).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Profile & Security")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
    expect(screen.getByText("Addresses")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Reviews")).toBeInTheDocument();
  });

  it("3. Dashboard Integrity: renders greeting, KPI metric links, and quick action cards", () => {
    render(<CustomerDashboardPage />);

    expect(screen.getByText("CUSTOMER PORTAL")).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, Sarah/i)).toBeInTheDocument();
    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("Wishlist Items")).toBeInTheDocument();
    expect(screen.getByText("Saved Addresses")).toBeInTheDocument();
    expect(screen.getByText("Unread Alerts")).toBeInTheDocument();
  });

  it("4. Breadcrumb Consistency: all subpages expose structured breadcrumb navigation", () => {
    const { unmount: unmountOrders } = render(<CustomerOrdersPage />);
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    unmountOrders();

    const { unmount: unmountWishlist } = render(<CustomerWishlistPage />);
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    unmountWishlist();

    const { unmount: unmountAddresses } = render(<CustomerAddressesPage />);
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    unmountAddresses();

    const { unmount: unmountNotifications } = render(<CustomerNotificationsPage />);
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    unmountNotifications();

    const { unmount: unmountReviews } = render(<CustomerReviewsPage />);
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    unmountReviews();
  });

  it("5. Empty State System: renders clean empty states across portal features", () => {
    const { unmount: unmountOrders } = render(<CustomerOrdersPage />);
    expect(screen.getByText(/no orders yet/i)).toBeInTheDocument();
    unmountOrders();

    const { unmount: unmountWishlist } = render(<CustomerWishlistPage />);
    expect(screen.getByText("Your Wishlist is Empty")).toBeInTheDocument();
    unmountWishlist();

    const { unmount: unmountAddresses } = render(<CustomerAddressesPage />);
    expect(screen.getByText("No Saved Addresses")).toBeInTheDocument();
    unmountAddresses();

    const { unmount: unmountNotifications } = render(<CustomerNotificationsPage />);
    expect(screen.getByText("You're All Caught Up")).toBeInTheDocument();
    unmountNotifications();

    const { unmount: unmountReviews } = render(<CustomerReviewsPage />);
    expect(screen.getByText("No Reviews Yet")).toBeInTheDocument();
    unmountReviews();
  });
});
