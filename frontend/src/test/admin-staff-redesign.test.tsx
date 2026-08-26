import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AdminStaffPage from "@/app/(admin)/admin/staff/page";
import StaffDetailPage from "@/app/(admin)/admin/staff/[id]/page";
import CreateStaffPage from "@/app/(admin)/admin/staff/create/page";
import { useUsers, useUser, useUpdateUserStatus, useRoles } from "@/hooks/use-users";
import { userService } from "@/services/user-service";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/staff",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/services/user-service", () => ({
  userService: {
    createUser: vi.fn(),
  },
}));

vi.mock("@/hooks/use-users", () => ({
  useUsers: vi.fn(),
  useUser: vi.fn(),
  useUpdateUserStatus: vi.fn(),
  useRoles: vi.fn(),
}));

const mockStaffMember = {
  id: "staff-1",
  first_name: "Elena",
  last_name: "Vance",
  full_name: "Elena Vance",
  email: "elena.vance@neurocommerce.ai",
  phone: "+1 555 019 2834",
  user_type: "staff",
  is_active: true,
  roles: ["catalog_manager"],
  profile: {
    employee_id: "EMP-NC-104",
    department: "Neural Systems",
    position: "Senior Neuro-Engineer",
  },
  last_login_at: "2026-08-22T10:30:00Z",
  created_at: "2026-08-01T00:00:00Z",
};

describe("Admin Staff & Administrator Accounts Operations Suite (STEP 27.11)", () => {
  const mockUpdateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUsers).mockReturnValue({
      data: {
        data: [mockStaffMember],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useUser).mockReturnValue({
      data: mockStaffMember,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useUpdateUserStatus).mockReturnValue({
      mutateAsync: mockUpdateStatus,
      isPending: false,
    } as any);

    vi.mocked(useRoles).mockReturnValue({
      data: [{ id: "role-1", name: "catalog_manager", label: "Catalog Manager" }],
      isLoading: false,
      isError: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and Add Staff CTA", () => {
    render(<AdminStaffPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("STAFF MANAGEMENT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /staff/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add staff member/i })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative staff telemetry", () => {
    render(<AdminStaffPage />);

    expect(screen.getByText("Total Staff")).toBeInTheDocument();
    expect(screen.getByText("1 Members")).toBeInTheDocument();
    expect(screen.getByText("Active Accounts")).toBeInTheDocument();
    expect(screen.getByText("1 Active")).toBeInTheDocument();
    expect(screen.getByText("Disabled Accounts")).toBeInTheDocument();
    expect(screen.getByText("0 Disabled")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search input and renders status options", () => {
    render(<AdminStaffPage />);

    const searchInput = screen.getByPlaceholderText(/search by name, email, or employee id/i);
    fireEvent.change(searchInput, { target: { value: "Elena" } });
    expect(searchInput).toHaveValue("Elena");

    expect(screen.getByText("All Statuses")).toBeInTheDocument();
  });

  it("4. Staff Table: renders name, initials, employee ID, department, and status", () => {
    render(<AdminStaffPage />);

    expect(screen.getByText("Elena Vance")).toBeInTheDocument();
    expect(screen.getByText("EV")).toBeInTheDocument();
    expect(screen.getByText("elena.vance@neurocommerce.ai")).toBeInTheDocument();
    expect(screen.getByText("EMP-NC-104")).toBeInTheDocument();
    expect(screen.getByText("Neural Systems")).toBeInTheDocument();
    expect(screen.getAllByText("Active").length).toBeGreaterThanOrEqual(1);
  });

  it("5. Toggle Status Action: triggers update status mutation", () => {
    render(<AdminStaffPage />);

    fireEvent.click(screen.getByRole("button", { name: /disable/i }));
    expect(screen.getByText("Deactivate this staff account?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /deactivate staff/i }));
    expect(mockUpdateStatus).toHaveBeenCalledWith({ id: "staff-1", isActive: false });
  });

  it("6. Staff Detail View: renders identity, department, roles, and account security", async () => {
    await act(async () => {
      render(<StaffDetailPage params={Promise.resolve({ id: "staff-1" })} />);
    });

    expect(screen.getByText("STAFF PROFILE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Elena Vance", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Employee Identity & Access")).toBeInTheDocument();
    expect(screen.getByText("Senior Neuro-Engineer")).toBeInTheDocument();
    expect(screen.getByText("Account Security")).toBeInTheDocument();
    expect(screen.getByText("Sanctum Token")).toBeInTheDocument();
  });

  it("7. Create Staff: validates required fields and submits form", async () => {
    vi.mocked(userService.createUser).mockResolvedValueOnce({
      ...mockStaffMember,
      id: "staff-new-1",
      full_name: "Gordon Freeman",
    } as any);

    render(<CreateStaffPage />);

    expect(screen.getByText("STAFF OPERATIONS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Onboard Staff Member", level: 1 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /onboard staff/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/employee id is required/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/first name \*/i), { target: { value: "Gordon" } });
    fireEvent.change(screen.getByLabelText(/last name \*/i), { target: { value: "Freeman" } });
    fireEvent.change(screen.getByLabelText(/work email \*/i), { target: { value: "gordon@neurocommerce.ai" } });
    fireEvent.change(screen.getByLabelText(/initial password \*/i), { target: { value: "ResonanceCascade2026!" } });
    fireEvent.change(screen.getByLabelText(/employee id \*/i), { target: { value: "EMP-NC-001" } });

    fireEvent.click(screen.getByRole("button", { name: /onboard staff/i }));

    await waitFor(() => {
      expect(userService.createUser).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/admin/staff/staff-new-1");
    });
  });

  it("8. Empty State: renders empty notice when 0 staff exist", () => {
    vi.mocked(useUsers).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 15, total: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminStaffPage />);

    expect(screen.getByText("No Staff Accounts")).toBeInTheDocument();
  });
});
