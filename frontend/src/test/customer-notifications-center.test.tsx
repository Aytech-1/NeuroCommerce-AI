import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CustomerNotificationsPage from "@/app/(portal)/account/notifications/page";
import {
  useCustomerNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteCustomerNotification,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-customer";

vi.mock("@/hooks/use-customer", () => ({
  useCustomerNotifications: vi.fn(),
  useMarkNotificationRead: vi.fn(),
  useMarkAllNotificationsRead: vi.fn(),
  useDeleteCustomerNotification: vi.fn(),
  useNotificationPreferences: vi.fn(),
  useUpdateNotificationPreferences: vi.fn(),
}));

const mockNotification1 = {
  id: "n-1",
  title: "Order Dispatched",
  body: "Your order ORD-2026-0001 has been dispatched via FedEx Laboratory Express.",
  read_at: null,
  created_at: "2026-08-20T00:00:00Z",
};

const mockNotification2 = {
  id: "n-2",
  title: "Security Notice",
  body: "A new laboratory device was authenticated with your account.",
  read_at: "2026-08-19T00:00:00Z",
  created_at: "2026-08-19T00:00:00Z",
};

const mockPreferences = [
  {
    id: "pref-1",
    channel: "email",
    category: "order_updates",
    is_enabled: true,
  },
  {
    id: "pref-2",
    channel: "sms",
    category: "promotions",
    is_enabled: false,
  },
];

describe("Customer Notifications & Communication Preferences Suite (STEP 26.12)", () => {
  const mockMarkRead = vi.fn();
  const mockMarkAllRead = vi.fn();
  const mockDeleteNotif = vi.fn();
  const mockUpdatePrefs = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCustomerNotifications).mockReturnValue({
      data: {
        data: [mockNotification1, mockNotification2],
        meta: { current_page: 1, per_page: 10, total: 2, last_page: 1 },
      },
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

    vi.mocked(useDeleteCustomerNotification).mockReturnValue({
      mutate: mockDeleteNotif,
      isPending: false,
    } as any);

    vi.mocked(useNotificationPreferences).mockReturnValue({
      data: mockPreferences,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useUpdateNotificationPreferences).mockReturnValue({
      mutate: mockUpdatePrefs,
      isPending: false,
    } as any);
  });

  it("1. Header & Unread Status: renders title, eyebrow, and 1 unread notification status", () => {
    render(<CustomerNotificationsPage />);

    expect(screen.getByText("ACCOUNT COMMUNICATIONS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText("1 unread notification")).toBeInTheDocument();
  });

  it("2. Notifications Feed: renders notification items with icons and unread New badge", () => {
    render(<CustomerNotificationsPage />);

    expect(screen.getByText("Order Dispatched")).toBeInTheDocument();
    expect(screen.getByText("Security Notice")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("3. Mark Single as Read: triggers mark read mutation", () => {
    render(<CustomerNotificationsPage />);

    const markReadBtn = screen.getByRole("button", { name: /mark as read/i });
    fireEvent.click(markReadBtn);

    expect(mockMarkRead).toHaveBeenCalledWith("n-1");
  });

  it("4. Mark All as Read: triggers mark all read mutation", () => {
    render(<CustomerNotificationsPage />);

    const markAllBtn = screen.getByRole("button", { name: /mark all read/i });
    fireEvent.click(markAllBtn);

    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it("5. Delete Notification: triggers delete mutation", () => {
    render(<CustomerNotificationsPage />);

    const deleteBtns = screen.getAllByRole("button", { name: /delete notification/i });
    expect(deleteBtns.length).toBe(2);

    fireEvent.click(deleteBtns[0]);
    expect(mockDeleteNotif).toHaveBeenCalledWith("n-1");
  });

  it("6. Communication Preferences: renders preference channels and toggles state", () => {
    render(<CustomerNotificationsPage />);

    expect(screen.getByText("Communication Preferences")).toBeInTheDocument();
    expect(screen.getByText("order updates")).toBeInTheDocument();
    expect(screen.getByText("promotions")).toBeInTheDocument();

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(2);

    fireEvent.click(checkboxes[1]);
    expect(mockUpdatePrefs).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          category: "promotions",
          channel: "sms",
          is_enabled: true,
        }),
      ])
    );
  });

  it("7. Empty State: renders all caught up when no notifications exist", () => {
    vi.mocked(useCustomerNotifications).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 10, total: 0, last_page: 1 } },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CustomerNotificationsPage />);

    expect(screen.getByText("You're All Caught Up")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue shopping/i })).toHaveAttribute("href", "/products");
  });
});
