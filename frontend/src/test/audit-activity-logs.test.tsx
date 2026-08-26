import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import AdminAuditLogsPage from "@/app/(admin)/admin/audit-logs/page";
import AuditLogDetailPage from "@/app/(admin)/admin/audit-logs/[id]/page";
import AdminActivityLogsPage from "@/app/(admin)/admin/activity-logs/page";
import { useAuditLogs, useAuditLog, useActivityLogs } from "@/hooks/use-audit";
import { AuditLogItem, ActivityLogItem } from "@/services/audit-service";

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
  old_values: { price: 299.99, stock: 15 },
  new_values: { price: 249.99, stock: 12 },
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

describe("Admin Audit & Activity Logs Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders audit logs table with event, model, and origin IP", () => {
    vi.mocked(useAuditLogs).mockReturnValue({
      data: {
        data: [mockAuditLog],
        meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminAuditLogsPage />);

    expect(screen.getByRole("cell", { name: /updated/i })).toBeInTheDocument();
    expect(screen.getByText("Product")).toBeInTheDocument();
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.100")).toBeInTheDocument();
  });

  it("renders audit log detail with before and after diff values", async () => {
    vi.mocked(useAuditLog).mockReturnValue({
      data: mockAuditLog,
      isLoading: false,
      isError: false,
    } as any);

    await act(async () => {
      render(<AuditLogDetailPage params={Promise.resolve({ id: "audit-1" })} />);
    });

    expect(screen.getByText("Attribute State Diff")).toBeInTheDocument();
    expect(screen.getByText("price")).toBeInTheDocument();
    expect(screen.getByText("299.99")).toBeInTheDocument();
    expect(screen.getByText("249.99")).toBeInTheDocument();
  });

  it("renders activity logs trail with action tag and description", () => {
    vi.mocked(useActivityLogs).mockReturnValue({
      data: {
        data: [mockActivityLog],
        meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminActivityLogsPage />);

    expect(screen.getByText(/user\.role_assigned/i)).toBeInTheDocument();
    expect(screen.getByText("Assigned role 'Inventory Manager' to user Sarah Connor")).toBeInTheDocument();
  });
});
