import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import AdminAuditLogsPage from "@/app/(admin)/admin/audit-logs/page";
import AuditLogDetailPage from "@/app/(admin)/admin/audit-logs/[id]/page";
import { useAuditLogs, useAuditLog } from "@/hooks/use-audit";
import { AuditLogItem } from "@/services/audit-service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/audit-logs",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/use-audit", () => ({
  useAuditLogs: vi.fn(),
  useAuditLog: vi.fn(),
  useActivityLogs: vi.fn(),
}));

const mockAuditLogs: AuditLogItem[] = [
  {
    id: "audit-001",
    user_id: "user-admin-1",
    user_type: "App\\Modules\\Auth\\Models\\User",
    user: {
      id: "user-admin-1",
      name: "Security Officer",
      email: "security@neurocommerce.ai",
    },
    event: "created",
    auditable_type: "App\\Modules\\Catalog\\Models\\Product",
    auditable_id: "prod-uuid-101",
    old_values: null,
    new_values: { name: "Quantum Processor", price: 999.99, is_active: true },
    url: "https://api.neurocommerce.ai/v1/admin/products",
    ip_address: "10.0.0.15",
    user_agent: "Mozilla/5.0 ComplianceBot/1.0",
    tags: ["inventory", "catalog"],
    created_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "audit-002",
    user_id: "user-admin-2",
    user_type: "App\\Modules\\Auth\\Models\\User",
    user: {
      id: "user-admin-2",
      name: "Finance Lead",
      email: "finance@neurocommerce.ai",
    },
    event: "updated",
    auditable_type: "App\\Modules\\Order\\Models\\Order",
    auditable_id: "ord-uuid-202",
    old_values: { payment_status: "pending", total: 500, stripe_secret_key: "sk_live_old" },
    new_values: { payment_status: "paid", total: 500, stripe_secret_key: "sk_live_new" },
    url: "https://api.neurocommerce.ai/v1/admin/orders/ord-uuid-202",
    ip_address: "10.0.0.25",
    user_agent: "Mozilla/5.0 AdminConsole/2.0",
    tags: ["finance", "orders"],
    created_at: "2026-09-02T14:30:00Z",
  },
  {
    id: "audit-003",
    user_id: null,
    user: null,
    event: "deleted",
    auditable_type: "App\\Modules\\Coupon\\Models\\Coupon",
    auditable_id: "coup-uuid-303",
    old_values: { code: "EXPIRED50", discount: 50 },
    new_values: null,
    url: "https://api.neurocommerce.ai/v1/admin/coupons/coup-uuid-303",
    ip_address: null,
    user_agent: null,
    tags: ["promotions"],
    created_at: "2026-09-03T09:15:00Z",
  },
];

describe("STEP 28.33 — Real Admin Audit Log & Security Activity Management Suite", () => {
  const refetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuditLogs).mockReturnValue({
      data: {
        data: mockAuditLogs,
        meta: { current_page: 1, per_page: 20, total: 3, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: refetchMock,
    } as any);

    vi.mocked(useAuditLog).mockReturnValue({
      data: mockAuditLogs[1],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  // 1. Breadcrumb & Headers
  it("1. renders breadcrumb navigation for audit logs", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("Admin Portal")).toBeInTheDocument();
    expect(screen.getByText("Audit Logs")).toBeInTheDocument();
  });

  it("2. renders security & compliance header and subtitle", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("SECURITY & COMPLIANCE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Security & Regulatory Audit Trail", level: 1 })).toBeInTheDocument();
  });

  it("3. renders refresh logs button and triggers refetch on click", () => {
    render(<AdminAuditLogsPage />);
    const refreshBtn = screen.getByRole("button", { name: /refresh logs/i });
    expect(refreshBtn).toBeInTheDocument();
    fireEvent.click(refreshBtn);
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  // 2. KPI Metrics
  it("4. renders total audited events KPI card", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("Total Audited Events")).toBeInTheDocument();
    expect(screen.getByText("3 Events")).toBeInTheDocument();
  });

  it("5. renders active mutations in view KPI card", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("Active Mutations")).toBeInTheDocument();
    expect(screen.getByText("3 In View")).toBeInTheDocument();
  });

  it("6. renders target models KPI card", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("Target Models")).toBeInTheDocument();
    expect(screen.getByText("3 Entities")).toBeInTheDocument();
  });

  it("7. renders security posture immutable ledger indicator", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("Security Posture")).toBeInTheDocument();
    expect(screen.getByText("Immutable Ledger")).toBeInTheDocument();
  });

  // 3. Filters & Search
  it("8. renders model type filter search input and handles typing", () => {
    render(<AdminAuditLogsPage />);
    const searchInput = screen.getByPlaceholderText(/filter by model type/i);
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: "Product" } });
    expect(searchInput).toHaveValue("Product");
  });

  it("9. renders event select dropdown with options", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("All Mutation Events")).toBeInTheDocument();
    const select = screen.getByDisplayValue("All Mutation Events");
    fireEvent.change(select, { target: { value: "updated" } });
    expect(select).toHaveValue("updated");
  });

  it("10. shows clear filters button when filter is applied and resets on click", () => {
    render(<AdminAuditLogsPage />);
    const searchInput = screen.getByPlaceholderText(/filter by model type/i);
    fireEvent.change(searchInput, { target: { value: "Order" } });
    
    const clearBtn = screen.getByRole("button", { name: /clear filters/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(searchInput).toHaveValue("");
  });

  // 4. Audit Table Content & Badges
  it("11. renders audit table with correct columns", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("Event")).toBeInTheDocument();
    expect(screen.getByText("Target Entity")).toBeInTheDocument();
    expect(screen.getByText("Actor")).toBeInTheDocument();
    expect(screen.getByText("Origin IP")).toBeInTheDocument();
    expect(screen.getByText("Timestamp")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("12. renders created, updated, and deleted event badges", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("created")).toBeInTheDocument();
    expect(screen.getByText("updated")).toBeInTheDocument();
    expect(screen.getByText("deleted")).toBeInTheDocument();
  });

  it("13. renders target entity models and entity IDs", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("ID: prod-uuid-101")).toBeInTheDocument();
    expect(screen.getByText("Order")).toBeInTheDocument();
    expect(screen.getByText("ID: ord-uuid-202")).toBeInTheDocument();
    expect(screen.getByText("Coupon")).toBeInTheDocument();
    expect(screen.getByText("ID: coup-uuid-303")).toBeInTheDocument();
  });

  it("14. renders actor names or fallback to system daemon", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("Security Officer")).toBeInTheDocument();
    expect(screen.getByText("security@neurocommerce.ai")).toBeInTheDocument();
    expect(screen.getByText("Finance Lead")).toBeInTheDocument();
    expect(screen.getByText("finance@neurocommerce.ai")).toBeInTheDocument();
    expect(screen.getByText("System / Automated")).toBeInTheDocument();
  });

  it("15. renders IP address or fallback to 127.0.0.1", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("10.0.0.15")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.25")).toBeInTheDocument();
    expect(screen.getByText("127.0.0.1")).toBeInTheDocument();
  });

  it("16. renders inspect diff link to detail page", () => {
    render(<AdminAuditLogsPage />);
    const diffButtons = screen.getAllByRole("button", { name: /inspect diff/i });
    expect(diffButtons.length).toBe(3);
  });

  it("17. renders pagination info and controls", () => {
    render(<AdminAuditLogsPage />);
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
  });

  // 5. Loading, Error, and Empty States
  it("18. renders loading skeleton during fetch", () => {
    vi.mocked(useAuditLogs).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminAuditLogsPage />);
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("19. renders error state with retry button on query failure", () => {
    vi.mocked(useAuditLogs).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: refetchMock,
    } as any);

    render(<AdminAuditLogsPage />);
    expect(screen.getByText("Failed to load audit logs")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry loading/i });
    fireEvent.click(retryBtn);
    expect(refetchMock).toHaveBeenCalled();
  });

  it("20. renders empty state when zero audit logs exist", () => {
    vi.mocked(useAuditLogs).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminAuditLogsPage />);
    expect(screen.getByText("No Audit Records Found")).toBeInTheDocument();
  });

  // 6. Detail Inspection Page
  it("21. renders audit log detail page context cards and diff table", async () => {
    await act(async () => {
      render(<AuditLogDetailPage params={Promise.resolve({ id: "audit-002" })} />);
    });

    expect(screen.getByText("AUDIT RECORD INSPECTION")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Audit Entry: UPDATED on Order/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Actor Identity")).toBeInTheDocument();
    expect(screen.getByText("Finance Lead")).toBeInTheDocument();
    expect(screen.getByText("Origin Network")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.25")).toBeInTheDocument();
    expect(screen.getByText("Target Resource")).toBeInTheDocument();
    expect(screen.getByText("Order")).toBeInTheDocument();
    expect(screen.getByText("Attribute State Diff")).toBeInTheDocument();
    expect(screen.getByText("payment_status")).toBeInTheDocument();
  });

  it("22. masks sensitive fields in detail diff table", async () => {
    await act(async () => {
      render(<AuditLogDetailPage params={Promise.resolve({ id: "audit-002" })} />);
    });

    expect(screen.getByText("stripe_secret_key")).toBeInTheDocument();
    expect(screen.getAllByText("••••••••••••••••").length).toBeGreaterThanOrEqual(1);
  });

  it("23. renders not found state when audit record is missing", async () => {
    vi.mocked(useAuditLog).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    await act(async () => {
      render(<AuditLogDetailPage params={Promise.resolve({ id: "non-existent" })} />);
    });

    expect(screen.getByText("Audit Record Not Found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back to audit trail/i })).toBeInTheDocument();
  });
});
