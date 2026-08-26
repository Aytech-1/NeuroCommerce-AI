import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminRolesPage from "@/app/(admin)/admin/roles/page";
import { useRoles, usePermissions, useSyncRolePermissions } from "@/hooks/use-users";
import { RoleItem } from "@/services/user-service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/roles",
  useSearchParams: () => new URLSearchParams(),
}));

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
    permissions: [{ id: "p1", name: "order.view", guard_name: "web" }],
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

const mockPermissions = [
  { id: "p1", name: "order.view", guard_name: "web" },
  { id: "p2", name: "product.create", guard_name: "web" },
  { id: "p3", name: "user.create", guard_name: "web" },
];

describe("Admin Roles & Authorization Governance Operations Suite (STEP 27.12)", () => {
  const mockSync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRoles).mockReturnValue({
      data: mockRoles,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(usePermissions).mockReturnValue({
      data: mockPermissions,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useSyncRolePermissions).mockReturnValue({
      mutateAsync: mockSync,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and breadcrumb navigation", () => {
    render(<AdminRolesPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("ACCESS GOVERNANCE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Roles & Permissions Matrix", level: 1 })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative RBAC telemetry", () => {
    render(<AdminRolesPage />);

    expect(screen.getByText("Total Roles")).toBeInTheDocument();
    expect(screen.getByText("2 Roles")).toBeInTheDocument();
    expect(screen.getAllByText("System Roles").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("1 Protected")).toBeInTheDocument();
    expect(screen.getAllByText("Custom Roles").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("1 Custom")).toBeInTheDocument();
    expect(screen.getByText("Registered Permissions")).toBeInTheDocument();
    expect(screen.getByText("3 Privileges")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search input and renders role filter options", () => {
    render(<AdminRolesPage />);

    const searchInput = screen.getByPlaceholderText(/search roles by name or description/i);
    fireEvent.change(searchInput, { target: { value: "inventory" } });
    expect(searchInput).toHaveValue("inventory");

    expect(screen.getByText("All Roles")).toBeInTheDocument();
  });

  it("4. Role Cards: renders role name, system badge, and permission count", () => {
    render(<AdminRolesPage />);

    expect(screen.getByText("super admin")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.getByText("inventory manager")).toBeInTheDocument();
    expect(screen.getByText("48 permissions")).toBeInTheDocument();
    expect(screen.getByText("12 permissions")).toBeInTheDocument();
  });

  it("5. Permission Configuration Dialog: opens modal, toggles permissions, and saves", async () => {
    render(<AdminRolesPage />);

    const configureButtons = screen.getAllByRole("button", { name: /configure permissions/i });
    fireEvent.click(configureButtons[0]);

    expect(screen.getByText("Configure Permissions: super admin")).toBeInTheDocument();
    expect(screen.getByText("order.view")).toBeInTheDocument();
    expect(screen.getByText("product.create")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /select all/i }));
    expect(screen.getByText("3 permissions assigned")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /save permissions/i }));
    expect(screen.getByText("Update role permissions?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /update permissions/i }));

    await waitFor(() => {
      expect(mockSync).toHaveBeenCalledWith({
        id: "r-1",
        permissions: ["order.view", "product.create", "user.create"],
      });
    });
  });

  it("6. Empty State: renders empty notice when 0 roles exist", () => {
    vi.mocked(useRoles).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminRolesPage />);

    expect(screen.getByText("No Roles Found")).toBeInTheDocument();
  });
});
