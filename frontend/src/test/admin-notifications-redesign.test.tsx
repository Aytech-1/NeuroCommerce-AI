import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import AdminNotificationsPage from "@/app/(admin)/admin/notifications/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import * as notifHooks from "@/hooks/use-notifications";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/admin/notifications",
}));

// Mock Can component
vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Authoritative Mock Data
const mockAdminNotifications = [
  {
    id: "notif-uuid-101",
    type: "order_confirmation",
    title: "Order #ORD-2026-9001 Placed",
    body: "Customer John Doe placed order #ORD-2026-9001 totaling $450.00.",
    data: { order_id: "ord-9001", order_number: "ORD-2026-9001" },
    read_at: null,
    created_at: "2026-09-05T04:30:00Z",
  },
  {
    id: "notif-uuid-102",
    type: "stock_low",
    title: "Low Stock Warning: NFS-HW-001",
    body: "Inventory item NFS-HW-001 is below threshold (4 units remaining).",
    data: { product_id: "prod-101", sku: "NFS-HW-001" },
    read_at: "2026-09-05T04:45:00Z",
    created_at: "2026-09-05T04:00:00Z",
  },
];

const mockTemplates = [
  {
    id: "tpl-uuid-201",
    name: "order_confirmation_email",
    channel: "email" as const,
    notification_type: "order_confirmation",
    subject: "NeuroCommerce AI - Order Confirmation #{{ order_number }}",
    body_template: "Hello {{ customer_name }}, your order #{{ order_number }} has been received.",
    variables: ["customer_name", "order_number", "grand_total"],
    is_active: true,
    created_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "tpl-uuid-202",
    name: "order_shipped_sms",
    channel: "sms" as const,
    notification_type: "order_shipped",
    subject: null,
    body_template: "Your order #{{ order_number }} has shipped via {{ carrier }}. Tracking: {{ tracking_number }}",
    variables: ["order_number", "carrier", "tracking_number"],
    is_active: true,
    created_at: "2026-09-01T10:00:00Z",
    updated_at: "2026-09-01T10:00:00Z",
  },
];

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe("Admin Notifications & Communication Management (STEP 28.24)", () => {
  const mockMarkRead = vi.fn();
  const mockMarkAllRead = vi.fn();
  const mockCreateTemplate = vi.fn();
  const mockDeleteTemplate = vi.fn();
  const mockBroadcast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(notifHooks, "useAdminNotifications").mockReturnValue({
      data: { data: mockAdminNotifications, meta: { total: 2 } },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(notifHooks, "useAdminUnreadCount").mockReturnValue({
      data: { unread_count: 1 },
      refetch: vi.fn(),
    } as any);

    vi.spyOn(notifHooks, "useNotificationTemplates").mockReturnValue({
      data: { data: mockTemplates, meta: { total: 2 } },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(notifHooks, "useMarkNotificationReadMutation").mockReturnValue({
      mutateAsync: mockMarkRead,
      isPending: false,
    } as any);

    vi.spyOn(notifHooks, "useMarkAllNotificationsReadMutation").mockReturnValue({
      mutateAsync: mockMarkAllRead,
      isPending: false,
    } as any);

    vi.spyOn(notifHooks, "useCreateTemplateMutation").mockReturnValue({
      mutateAsync: mockCreateTemplate,
      isPending: false,
    } as any);

    vi.spyOn(notifHooks, "useDeleteTemplateMutation").mockReturnValue({
      mutateAsync: mockDeleteTemplate,
      isPending: false,
    } as any);

    vi.spyOn(notifHooks, "useBroadcastNotificationMutation").mockReturnValue({
      mutateAsync: mockBroadcast.mockResolvedValue({ dispatched_count: 10 }),
      isPending: false,
    } as any);
  });

  it("1. Renders executive notifications header, breadcrumbs, and operational tabs", () => {
    renderWithClient(<AdminNotificationsPage />);

    expect(screen.getByText(/Notification & Communication Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/OPERATIONAL COMMUNICATIONS & NOTIFICATION DISPATCH/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /In-App Alerts/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Communication Templates/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Broadcast Dispatcher/i })).toBeInTheDocument();
  });

  it("2. Renders all 4 core KPI summary cards with authoritative metrics", () => {
    renderWithClient(<AdminNotificationsPage />);

    expect(screen.getByText("Total Alerts")).toBeInTheDocument();
    expect(screen.getByText("Unread Alerts")).toBeInTheDocument();
    expect(screen.getByText("Active Templates")).toBeInTheDocument();
    expect(screen.getByText("Channel Engine")).toBeInTheDocument();
    expect(screen.getByText("4 Channels Operational")).toBeInTheDocument();
  });

  it("3. Renders the In-App alerts list with titles, timestamps, and deep source links", () => {
    renderWithClient(<AdminNotificationsPage />);

    expect(screen.getByText("Order #ORD-2026-9001 Placed")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Warning: NFS-HW-001")).toBeInTheDocument();
    expect(screen.getByText("View Order")).toBeInTheDocument();
  });

  it("4. Switches between All, Unread, and Read filters", async () => {
    renderWithClient(<AdminNotificationsPage />);

    const unreadFilterBtn = screen.getByRole("button", { name: "unread" });
    await act(async () => {
      fireEvent.click(unreadFilterBtn);
    });

    expect(screen.getByText("Order #ORD-2026-9001 Placed")).toBeInTheDocument();
    expect(screen.queryByText("Low Stock Warning: NFS-HW-001")).not.toBeInTheDocument();
  });

  it("5. Opens notification details telemetry modal and displays sanitized payload", async () => {
    renderWithClient(<AdminNotificationsPage />);

    const detailButtons = screen.getAllByRole("button", { name: /Details/i });
    await act(async () => {
      fireEvent.click(detailButtons[0]);
    });

    expect(screen.getByText("Notification Telemetry")).toBeInTheDocument();
    expect(screen.getByText(/Structured Payload \(Sanitized\)/i)).toBeInTheDocument();
  });

  it("6. Executes Mark Read and Mark All Read actions cleanly", async () => {
    renderWithClient(<AdminNotificationsPage />);

    const markReadBtn = screen.getByRole("button", { name: /Mark Read/i });
    await act(async () => {
      fireEvent.click(markReadBtn);
    });

    expect(mockMarkRead).toHaveBeenCalledWith("notif-uuid-101");

    const markAllReadBtn = screen.getByRole("button", { name: /Mark All Read/i });
    await act(async () => {
      fireEvent.click(markAllReadBtn);
    });

    expect(mockMarkAllRead).toHaveBeenCalled();
  });

  it("7. Switches to Communication Templates tab and renders template table", async () => {
    renderWithClient(<AdminNotificationsPage />);

    const templatesTab = screen.getByRole("button", { name: /Communication Templates/i });
    await act(async () => {
      fireEvent.click(templatesTab);
    });

    expect(screen.getByText("order_confirmation_email")).toBeInTheDocument();
    expect(screen.getByText("order_shipped_sms")).toBeInTheDocument();
    expect(screen.getByText("{{ customer_name }}")).toBeInTheDocument();
  });

  it("8. Opens Create Template modal and handles template inputs", async () => {
    renderWithClient(<AdminNotificationsPage />);

    const templatesTab = screen.getByRole("button", { name: /Communication Templates/i });
    await act(async () => {
      fireEvent.click(templatesTab);
    });

    const newTemplateBtn = screen.getByRole("button", { name: /New Template/i });
    await act(async () => {
      fireEvent.click(newTemplateBtn);
    });

    expect(screen.getByText("Create Notification Template")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. order_confirmation_email")).toBeInTheDocument();
  });

  it("9. Switches to System Broadcast Dispatcher and renders composer form", async () => {
    renderWithClient(<AdminNotificationsPage />);

    const broadcastTab = screen.getByRole("button", { name: /Broadcast Dispatcher/i });
    await act(async () => {
      fireEvent.click(broadcastTab);
    });

    expect(screen.getByText(/Broadcast Authority:/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Scheduled System Maintenance Notification/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter broadcast message text/i)).toBeInTheDocument();
  });
});
