import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import AdminStaffPage from "@/app/(admin)/admin/staff/page";
import StaffDetailPage from "@/app/(admin)/admin/staff/[id]/page";
import CreateStaffPage from "@/app/(admin)/admin/staff/create/page";
import AdminRolesPage from "@/app/(admin)/admin/roles/page";
import {
  useUsers,
  useUser,
  useRoles,
  usePermissions,
  useUpdateUserStatus,
  useAssignUserRoles,
  useSyncRolePermissions,
} from "@/hooks/use-users";
import { UserItem, UserDetail, RoleItem, PermissionItem } from "@/services/user-service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/staff",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { id: "admin-1", user_type: "super_admin", permissions: ["user.create", "user.view"] },
      hasPermission: () => true,
      hasRole: () => true,
    }),
}));

vi.mock("@/hooks/use-users", () => ({
  useUsers: vi.fn(),
  useUser: vi.fn(),
  useRoles: vi.fn(),
  usePermissions: vi.fn(),
  useUpdateUserStatus: vi.fn(),
  useDeleteUser: vi.fn(),
  useAssignUserRoles: vi.fn(),
  useSyncRolePermissions: vi.fn(),
}));

const mockStaffList: UserItem[] = [
  {
    id: "staff-101",
    first_name: "Sarah",
    last_name: "Connor",
    full_name: "Sarah Connor",
    email: "sarah.connor@neurocommerce.ai",
    phone: "+1 555 100 2001",
    user_type: "staff",
    is_active: true,
    roles: ["manager"],
    permissions: ["product.view", "product.update", "order.view"],
    created_at: "2026-08-01T09:00:00Z",
    profile: {
      employee_id: "EMP-2026-01",
      department: "Operations",
      position: "Store Manager",
    },
  },
  {
    id: "staff-102",
    first_name: "John",
    last_name: "Reese",
    full_name: "John Reese",
    email: "john.reese@neurocommerce.ai",
    phone: "+1 555 100 2002",
    user_type: "admin",
    is_active: false,
    roles: ["admin"],
    permissions: ["user.view", "user.update", "settings.view"],
    created_at: "2026-08-10T11:30:00Z",
    profile: {
      employee_id: "EMP-2026-02",
      department: "Security & Governance",
      position: "Platform Administrator",
    },
  },
];

const mockStaffDetail: UserDetail = {
  ...mockStaffList[0],
  timezone: "UTC",
  currency_code: "USD",
  locale: "en",
};

const mockRoles: RoleItem[] = [
  {
    id: "role-1",
    name: "super_admin",
    guard_name: "api",
    description: "Super Administrator with full platform bypass access",
    is_system: true,
    permissions_count: 50,
    permissions: ["user.view", "user.create", "settings.update"],
  },
  {
    id: "role-2",
    name: "manager",
    guard_name: "api",
    description: "Store Manager with catalog, inventory, and order operations",
    is_system: true,
    permissions_count: 15,
    permissions: ["product.view", "product.update", "order.view"],
  },
  {
    id: "role-3",
    name: "custom_auditor",
    guard_name: "api",
    description: "Custom compliance and review officer",
    is_system: false,
    permissions_count: 4,
    permissions: ["audit.view", "report.view"],
  },
];

const mockPermissions: PermissionItem[] = [
  { id: "perm-1", name: "user.view", guard_name: "api", group: "user", description: "View users" },
  { id: "perm-2", name: "user.create", guard_name: "api", group: "user", description: "Create staff" },
  { id: "perm-3", name: "product.view", guard_name: "api", group: "catalog", description: "View products" },
  { id: "perm-4", name: "audit.view", guard_name: "api", group: "admin", description: "View audit logs" },
];

describe("STEP 28.34 — Real Admin Staff, Roles & RBAC Management Suite", () => {
  const refetchUsersMock = vi.fn();
  const mutateStatusMock = vi.fn().mockResolvedValue({});
  const mutateRolesMock = vi.fn().mockResolvedValue({});
  const mutateSyncPermsMock = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUsers).mockReturnValue({
      data: {
        data: mockStaffList,
        meta: { current_page: 1, per_page: 15, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: refetchUsersMock,
    } as any);

    vi.mocked(useUser).mockReturnValue({
      data: mockStaffDetail,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

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
      refetch: vi.fn(),
    } as any);

    vi.mocked(useUpdateUserStatus).mockReturnValue({
      mutateAsync: mutateStatusMock,
      isPending: false,
    } as any);

    vi.mocked(useAssignUserRoles).mockReturnValue({
      mutateAsync: mutateRolesMock,
      isPending: false,
    } as any);

    vi.mocked(useSyncRolePermissions).mockReturnValue({
      mutateAsync: mutateSyncPermsMock,
      isPending: false,
    } as any);
  });

  // 1. Staff Listing & Header
  it("1. renders staff page breadcrumbs, title, and Add Staff Member CTA", () => {
    render(<AdminStaffPage />);
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("STAFF MANAGEMENT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Staff & Administrative Team", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add staff member/i })).toBeInTheDocument();
  });

  it("2. renders staff KPI metrics from real backend counts", () => {
    render(<AdminStaffPage />);
    expect(screen.getByText("Total Staff")).toBeInTheDocument();
    expect(screen.getByText("2 Members")).toBeInTheDocument();
    expect(screen.getByText("Active Accounts")).toBeInTheDocument();
    expect(screen.getByText("1 Active")).toBeInTheDocument();
    expect(screen.getByText("Disabled Accounts")).toBeInTheDocument();
    expect(screen.getByText("1 Disabled")).toBeInTheDocument();
  });

  // 2. Staff Table & Search
  it("3. renders staff table headers and rows with employee metadata", () => {
    render(<AdminStaffPage />);
    expect(screen.getByText("Staff Member")).toBeInTheDocument();
    expect(screen.getByText("Employee ID")).toBeInTheDocument();
    expect(screen.getByText("Department")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText("sarah.connor@neurocommerce.ai")).toBeInTheDocument();
    expect(screen.getByText("EMP-2026-01")).toBeInTheDocument();
    expect(screen.getByText("Operations")).toBeInTheDocument();

    expect(screen.getByText("John Reese")).toBeInTheDocument();
    expect(screen.getByText("EMP-2026-02")).toBeInTheDocument();
  });

  it("4. handles search input changes", () => {
    render(<AdminStaffPage />);
    const searchInput = screen.getByPlaceholderText(/search by name, email, or employee id/i);
    fireEvent.change(searchInput, { target: { value: "Sarah" } });
    expect(searchInput).toHaveValue("Sarah");
  });

  it("5. filters staff by status dropdown and clears filter", () => {
    render(<AdminStaffPage />);
    const select = screen.getByDisplayValue("All Statuses");
    fireEvent.change(select, { target: { value: "1" } });
    expect(select).toHaveValue("1");

    const clearBtn = screen.getByRole("button", { name: /clear filters/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(select).toHaveValue("");
  });

  // 3. Status Toggle & Confirmation
  it("6. opens confirmation dialog before deactivating active staff", () => {
    render(<AdminStaffPage />);
    const disableButtons = screen.getAllByRole("button", { name: /disable/i });
    fireEvent.click(disableButtons[0]);

    expect(screen.getByText("Deactivate this staff account?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deactivate Staff" })).toBeInTheDocument();
  });

  it("7. directly activates disabled staff without deactivation warning", async () => {
    render(<AdminStaffPage />);
    const enableButton = screen.getByRole("button", { name: /enable/i });
    await act(async () => {
      fireEvent.click(enableButton);
    });

    expect(mutateStatusMock).toHaveBeenCalledWith({
      id: "staff-102",
      isActive: true,
    });
  });

  // 4. Loading, Error, and Empty States
  it("8. renders loading skeleton during fetch", () => {
    vi.mocked(useUsers).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminStaffPage />);
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("9. renders error state with retry CTA on fetch error", () => {
    vi.mocked(useUsers).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: refetchUsersMock,
    } as any);

    render(<AdminStaffPage />);
    expect(screen.getByText("Failed to load staff roster")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry loading/i });
    fireEvent.click(retryBtn);
    expect(refetchUsersMock).toHaveBeenCalled();
  });

  it("10. renders empty state when zero staff accounts are found", () => {
    vi.mocked(useUsers).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 15, total: 0, last_page: 1 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminStaffPage />);
    expect(screen.getByText("No Staff Accounts")).toBeInTheDocument();
  });

  // 5. Staff Detail Page
  it("11. renders staff detail page with employee identity and audit link", async () => {
    await act(async () => {
      render(<StaffDetailPage params={Promise.resolve({ id: "staff-101" })} />);
    });

    expect(screen.getByText("STAFF PROFILE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sarah Connor", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Employee Identity & Access")).toBeInTheDocument();
    expect(screen.getByText("sarah.connor@neurocommerce.ai")).toBeInTheDocument();
    expect(screen.getByText("+1 555 100 2001")).toBeInTheDocument();
    expect(screen.getByText("Store Manager")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /audit trail/i })).toBeInTheDocument();
  });

  it("12. renders effective permissions on staff detail page", async () => {
    await act(async () => {
      render(<StaffDetailPage params={Promise.resolve({ id: "staff-101" })} />);
    });

    expect(screen.getByText("Effective Permissions (3)")).toBeInTheDocument();
    expect(screen.getByText("product.view")).toBeInTheDocument();
    expect(screen.getByText("product.update")).toBeInTheDocument();
    expect(screen.getByText("order.view")).toBeInTheDocument();
  });

  it("13. opens role assignment dialog from staff detail page", async () => {
    await act(async () => {
      render(<StaffDetailPage params={Promise.resolve({ id: "staff-101" })} />);
    });

    const assignRolesBtn = screen.getByRole("button", { name: /assign roles/i });
    fireEvent.click(assignRolesBtn);

    expect(screen.getByText(/Manage Roles: Sarah Connor/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save roles/i })).toBeInTheDocument();
  });

  it("14. renders not found state when staff profile does not exist", async () => {
    vi.mocked(useUser).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    await act(async () => {
      render(<StaffDetailPage params={Promise.resolve({ id: "unknown-id" })} />);
    });

    expect(screen.getByText("Staff Member Not Found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back to staff roster/i })).toBeInTheDocument();
  });

  // 6. Roles & Permissions Matrix Page
  it("15. renders roles page header, KPI metrics, and system role cards", () => {
    render(<AdminRolesPage />);
    expect(screen.getByText("ACCESS GOVERNANCE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Roles & Permissions Matrix", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Total Roles")).toBeInTheDocument();
    expect(screen.getByText("3 Roles")).toBeInTheDocument();
    expect(screen.getAllByText("System Roles").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2 Protected")).toBeInTheDocument();
    expect(screen.getAllByText("Custom Roles").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("1 Custom")).toBeInTheDocument();
  });

  it("16. renders role cards with granted privileges count and system badges", () => {
    render(<AdminRolesPage />);
    expect(screen.getByRole("heading", { name: /super admin/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /manager/i, level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /custom auditor/i, level: 2 })).toBeInTheDocument();
    expect(screen.getAllByText("System").length).toBe(2);
    expect(screen.getByText("50 permissions")).toBeInTheDocument();
  });

  it("17. searches and filters roles on roles page", () => {
    render(<AdminRolesPage />);
    const searchInput = screen.getByPlaceholderText(/search roles by name or description/i);
    fireEvent.change(searchInput, { target: { value: "auditor" } });
    expect(searchInput).toHaveValue("auditor");

    const filterSelect = screen.getByDisplayValue("All Roles");
    fireEvent.change(filterSelect, { target: { value: "custom" } });
    expect(filterSelect).toHaveValue("custom");
  });

  it("18. opens configure permissions dialog for a role", () => {
    render(<AdminRolesPage />);
    const configButtons = screen.getAllByRole("button", { name: /configure permissions/i });
    fireEvent.click(configButtons[1]); // Manager

    expect(screen.getByText(/Configure Permissions: manager/i)).toBeInTheDocument();
    expect(screen.getByText("user.view")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /select all/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /clear all/i })).toBeInTheDocument();
  });

  it("19. triggers permission sync confirmation on permission save", () => {
    render(<AdminRolesPage />);
    const configButtons = screen.getAllByRole("button", { name: /configure permissions/i });
    fireEvent.click(configButtons[1]);

    const saveBtn = screen.getByRole("button", { name: /save permissions/i });
    fireEvent.click(saveBtn);

    expect(screen.getByText("Update role permissions?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Permissions" })).toBeInTheDocument();
  });

  // 7. Create Staff Form
  it("20. renders create staff form with validation fields", () => {
    render(<CreateStaffPage />);
    expect(screen.getByText("STAFF OPERATIONS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Onboard Staff Member", level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Initial Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /onboard staff/i })).toBeInTheDocument();
  });
});
