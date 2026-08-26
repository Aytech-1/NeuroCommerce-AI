import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminRolesPage from "@/app/(admin)/admin/roles/page";
import { useRoles, usePermissions, useSyncRolePermissions } from "@/hooks/use-users";
import { RoleItem } from "@/services/user-service";

vi.mock("@/hooks/use-users", () => ({
  useRoles: vi.fn(),
  usePermissions: vi.fn(),
  useSyncRolePermissions: vi.fn(),
}));

const mockRoles: RoleItem[] = [
  {
    id: "r-1",
    name: "super_admin",
    guard_name: "web",
    description: "Full platform superuser privileges",
    is_system: true,
    permissions_count: 48,
    permissions: [],
  },
  {
    id: "r-2",
    name: "inventory_manager",
    guard_name: "web",
    description: "Warehouse and stock administration",
    is_system: false,
    permissions_count: 12,
    permissions: [],
  },
];

describe("Admin Roles & Permissions Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSyncRolePermissions).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(usePermissions).mockReturnValue({
      data: [{ id: "p1", name: "order.view", guard_name: "web" }],
      isLoading: false,
    } as any);
  });

  it("renders role cards with system badge and permission count", () => {
    vi.mocked(useRoles).mockReturnValue({
      data: mockRoles,
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminRolesPage />);

    expect(screen.getByText("super admin")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.getByText("inventory manager")).toBeInTheDocument();
    expect(screen.getByText("48 permissions")).toBeInTheDocument();
    expect(screen.getByText("12 permissions")).toBeInTheDocument();
  });
});
