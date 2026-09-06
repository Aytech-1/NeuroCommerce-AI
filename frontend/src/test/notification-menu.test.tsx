import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { useNotificationStore } from "@/stores/notification-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  useCustomerNotifications,
  useCustomerUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-customer";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/hooks/use-customer", () => ({
  useCustomerNotifications: vi.fn(),
  useCustomerUnreadCount: vi.fn(),
  useMarkNotificationRead: vi.fn(),
  useMarkAllNotificationsRead: vi.fn(),
}));

const mockRealNotifications = [
  {
    id: "notif-real-1",
    user_id: "user-1",
    type: "order_confirmation",
    channel: "database",
    title: "Order Confirmed #ORD-9988",
    body: "Your order #ORD-9988 has been received and is processing.",
    data: { order_id: "ord-123" },
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-real-2",
    user_id: "user-1",
    type: "shipping_update",
    channel: "database",
    title: "Shipment Dispatched",
    body: "FedEx tracking active for neural headset.",
    data: { action_url: "/account/orders/ord-123" },
    is_read: true,
    read_at: new Date(Date.now() - 3600 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
];

describe("NotificationMenu Component Suite (STEP 28.11)", () => {
  const mockMarkRead = vi.fn();
  const mockMarkAllRead = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useNotificationStore.setState({
      unreadCount: 0,
      isOpen: false,
    });
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: "user-1", email: "researcher@example.com", first_name: "Lab", last_name: "Admin" } as any,
    });

    vi.mocked(useCustomerUnreadCount).mockReturnValue({} as any);

    vi.mocked(useCustomerNotifications).mockReturnValue({
      data: { data: mockRealNotifications, meta: { total: 2 } },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    vi.mocked(useMarkNotificationRead).mockReturnValue({
      mutate: mockMarkRead,
      isPending: false,
    } as any);

    vi.mocked(useMarkAllNotificationsRead).mockReturnValue({
      mutate: mockMarkAllRead,
      isPending: false,
    } as any);
  });

  it("1. Notification Bell: renders accessible trigger without badge when unreadCount is 0", () => {
    render(<NotificationMenu />);
    const bellButton = screen.getByRole("button", { name: /notifications/i });
    expect(bellButton).toBeInTheDocument();
    expect(bellButton).toHaveAttribute("aria-haspopup", "true");
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("2. Unread Count Badge: displays authoritative badge when unreadCount > 0", () => {
    useNotificationStore.setState({ unreadCount: 5 });
    render(<NotificationMenu />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("3. Unread Count 99+: displays 99+ when unreadCount exceeds 99", () => {
    useNotificationStore.setState({ unreadCount: 150 });
    render(<NotificationMenu />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("4. Real Notifications Render: opens dropdown panel and renders live notification items from query", () => {
    useNotificationStore.setState({ unreadCount: 1 });
    render(<NotificationMenu />);

    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);

    expect(screen.getByText("Order Confirmed #ORD-9988")).toBeInTheDocument();
    expect(screen.getByText("Shipment Dispatched")).toBeInTheDocument();
    expect(screen.getByText(/5m ago/i)).toBeInTheDocument();
  });

  it("5. Mark Single Notification As Read: triggers mutation and routes to target", () => {
    useNotificationStore.setState({ unreadCount: 1 });
    render(<NotificationMenu />);

    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);

    const unreadItem = screen.getByText("Order Confirmed #ORD-9988");
    fireEvent.click(unreadItem);

    expect(mockMarkRead).toHaveBeenCalledWith("notif-real-1");
    expect(mockPush).toHaveBeenCalledWith("/account/orders/ord-123");
  });

  it("6. Mark All As Read: executes mutation when Mark all read is clicked", () => {
    useNotificationStore.setState({ unreadCount: 2 });
    render(<NotificationMenu />);

    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);

    const markAllBtn = screen.getByRole("button", { name: /mark all read/i });
    expect(markAllBtn).toBeInTheDocument();

    fireEvent.click(markAllBtn);
    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it("7. Loading State: renders pulse skeletons during query fetching", () => {
    vi.mocked(useCustomerNotifications).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<NotificationMenu />);
    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);

    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it("8. Empty State: renders empty notice when backend returns 0 notifications", () => {
    vi.mocked(useCustomerNotifications).mockReturnValue({
      data: { data: [], meta: { total: 0 } },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<NotificationMenu />);
    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);

    expect(screen.getByText("You're all caught up")).toBeInTheDocument();
    expect(screen.getByText("No new notifications")).toBeInTheDocument();
  });

  it("9. Error State: renders error message and retry button", () => {
    vi.mocked(useCustomerNotifications).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<NotificationMenu />);
    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);

    expect(screen.getByText("Unable to load notifications")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("10. Unauthenticated State: shows sign in prompt when unauthenticated", () => {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
    });

    render(<NotificationMenu />);
    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);

    expect(screen.getByText("Sign in for alerts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });
});

