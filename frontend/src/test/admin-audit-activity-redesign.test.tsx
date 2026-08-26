import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import AdminAuditLogsPage from "@/app/(admin)/admin/audit-logs/page";
import AuditLogDetailPage from "@/app/(admin)/admin/audit-logs/[id]/page";
import AdminActivityLogsPage from "@/app/(admin)/admin/activity-logs/page";
import { useAuditLogs, useAuditLog, useActivityLogs } from "@/hooks/use-audit";
import { AuditLogItem, ActivityLogItem } from "@/services/audit-service";

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

const mockAuditLog: AuditLogItem = {
  id: "audit-1",
  user_id: "u-1",
  user: {
    id: "u-1",
    name: "Admin User",
    email: "admin@neurocommerce.ai",
  },
  event: "updated",
  auditable_type: "App\\Modules\\Catalog\\Models\\Product",
  auditable_id: "prod-101",
  old_values: { price: 299.99, stock: 15, api_key: "secret_123" },
  new_values: { price: 249.99, stock: 12, api_key: "secret_456" },
  ip_address: "192.168.1.100",
  user_agent: "Mozilla/5.0 Chrome/120.0",
  created_at: "2026-08-20T12:00:00Z",
};

const mockActivityLog: ActivityLogItem = {
  id: "act-1",
  user_id: "u-1",
  user: {
    id: "u-1",
    name: "Admin User",
    email: "admin@neurocommerce.ai",
  },
  action: "user.role_assigned",
  description: "Assigned role 'Inventory Manager' to user Sarah Connor",
  ip_address: "192.168.1.100",
  created_at: "2026-08-20T12:00:00Z",
};

describe("Admin Audit Logs & Operational Activity Governance Suite (STEP 27.15)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuditLogs).mockReturnValue({
      data: {
        data: [mockAuditLog],
        meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useActivityLogs).mockReturnValue({
      data: {
        data: [mockActivityLog],
        meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it("1. Audit Logs Header & Breadcrumbs: renders title, eyebrow, and Refresh Logs CTA", () => {
    render(<AdminAuditLogsPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("SECURITY & COMPLIANCE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Security & Regulatory Audit Trail", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh logs/i })).toBeInTheDocument();
  });

  it("2. Audit Summary Metrics: renders authoritative audit telemetry", () => {
    render(<AdminAuditLogsPage />);

    expect(screen.getByText("Total Audited Events")).toBeInTheDocument();
    expect(screen.getByText("1 Events")).toBeInTheDocument();
    expect(screen.getByText("Active Mutations")).toBeInTheDocument();
    expect(screen.getByText("1 In View")).toBeInTheDocument();
    expect(screen.getByText("Target Models")).toBeInTheDocument();
    expect(screen.getByText("1 Entities")).toBeInTheDocument();
  });

  it("3. Audit Filter Toolbar: updates search and filter select", () => {
    render(<AdminAuditLogsPage />);

    const searchInput = screen.getByPlaceholderText(/filter by model type/i);
    fireEvent.change(searchInput, { target: { value: "Product" } });
    expect(searchInput).toHaveValue("Product");

    expect(screen.getByText("All Mutation Events")).toBeInTheDocument();
  });

  it("4. Audit Table: renders event badge, target entity, actor, and IP", () => {
    render(<AdminAuditLogsPage />);

    expect(screen.getByText("updated")).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.100")).toBeInTheDocument();
  });

  it("5. Audit Log Detail Inspection: renders context cards, diff table, and masks sensitive keys", async () => {
    vi.mocked(useAuditLog).mockReturnValue({
      data: mockAuditLog,
      isLoading: false,
      isError: false,
    } as any);

    await act(async () => {
      render(<AuditLogDetailPage params={Promise.resolve({ id: "audit-1" })} />);
    });

    expect(screen.getByText("Attribute State Diff")).toBeInTheDocument();
    expect(screen.getByText("Actor Identity")).toBeInTheDocument();
    expect(screen.getByText("Origin Network")).toBeInTheDocument();
    expect(screen.getByText("price")).toBeInTheDocument();
    expect(screen.getByText("299.99")).toBeInTheDocument();
    expect(screen.getByText("249.99")).toBeInTheDocument();
    expect(screen.getAllByText("••••••••••••••••").length).toBeGreaterThanOrEqual(1);
  });

  it("6. Activity Logs Page: renders header, telemetry, and activity rows", () => {
    render(<AdminActivityLogsPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("OPERATIONS ACTIVITY")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Activity Logs & Operational Events", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Total Activities")).toBeInTheDocument();
    expect(screen.getByText("1 Activities")).toBeInTheDocument();
    expect(screen.getByText("user.role_assigned")).toBeInTheDocument();
    expect(screen.getByText("Assigned role 'Inventory Manager' to user Sarah Connor")).toBeInTheDocument();
  });

  it("7. Empty States: renders empty state when 0 records exist", () => {
    vi.mocked(useAuditLogs).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 20, total: 0, last_page: 1 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminAuditLogsPage />);

    expect(screen.getByText("No Audit Records Found")).toBeInTheDocument();
  });
});
