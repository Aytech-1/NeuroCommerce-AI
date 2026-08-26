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

describe("Customer Notifications Suite", () => {
  const mockMarkRead = vi.fn();
  const mockMarkAllRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCustomerNotifications).mockReturnValue({
      data: {
        data: [
          {
            id: "notif-1",
            title: "Hardware Dispatch Update",
            body: "Your order ORD-2026-0001 has been dispatched via USPS Laboratory Express.",
            read_at: null,
            created_at: "2026-08-20T00:00:00Z",
          },
        ],
        meta: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
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
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useNotificationPreferences).mockReturnValue({
      data: [
        {
          id: "pref-1",
          channel: "email",
          category: "order_updates",
          is_enabled: true,
        },
      ],
      isLoading: false,
    } as any);

    vi.mocked(useUpdateNotificationPreferences).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it("renders notification items with unread badge", () => {
    render(<CustomerNotificationsPage />);

    expect(screen.getByText("Notifications & Alerts")).toBeInTheDocument();
    expect(screen.getByText("Hardware Dispatch Update")).toBeInTheDocument();
    expect(screen.getByText(/ORD-2026-0001 has been dispatched/i)).toBeInTheDocument();
    expect(screen.getByText(/New/i)).toBeInTheDocument();
  });

  it("triggers mark all as read action on button click", () => {
    render(<CustomerNotificationsPage />);

    const markAllBtn = screen.getByRole("button", { name: /mark all read/i });
    fireEvent.click(markAllBtn);

    expect(mockMarkAllRead).toHaveBeenCalled();
  });
});
