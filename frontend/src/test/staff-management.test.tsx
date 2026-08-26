import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminStaffPage from "@/app/(admin)/admin/staff/page";
import CreateStaffPage from "@/app/(admin)/admin/staff/create/page";
import { useUsers, useRoles, useUpdateUserStatus } from "@/hooks/use-users";
import { userService, UserItem } from "@/services/user-service";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/services/user-service", () => ({
  userService: {
    createUser: vi.fn(),
  },
}));

vi.mock("@/hooks/use-users", () => ({
  useUsers: vi.fn(),
  useRoles: vi.fn(),
  useUpdateUserStatus: vi.fn(),
}));

const mockStaff: UserItem = {
  id: "staff-1",
  first_name: "Marcus",
  last_name: "Vance",
  full_name: "Marcus Vance",
  email: "marcus@neurocommerce.ai",
  user_type: "staff",
  is_active: true,
  roles: ["catalog_manager"],
  created_at: "2026-08-20T00:00:00Z",
  profile: {
    employee_id: "EMP-2026-01",
    department: "Catalog Ops",
    position: "Senior Specialist",
  },
};

describe("Admin Staff Management Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRoles).mockReturnValue({
      data: [{ id: "r1", name: "catalog_manager", guard_name: "web" }],
      isLoading: false,
    } as any);

    vi.mocked(useUpdateUserStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("renders staff roster table with employee details", () => {
    vi.mocked(useUsers).mockReturnValue({
      data: {
        data: [mockStaff],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminStaffPage />);

    expect(screen.getByText("Marcus Vance")).toBeInTheDocument();
    expect(screen.getByText("marcus@neurocommerce.ai")).toBeInTheDocument();
    expect(screen.getByText("EMP-2026-01")).toBeInTheDocument();
    expect(screen.getByText("Catalog Ops")).toBeInTheDocument();
    expect(screen.getByText("catalog manager")).toBeInTheDocument();
  });

  it("validates required fields on staff creation submit", async () => {
    render(<CreateStaffPage />);

    fireEvent.click(screen.getByRole("button", { name: /onboard staff/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/employee id is required/i)).toBeInTheDocument();
    });
  });

  it("submits valid staff payload and redirects to staff profile", async () => {
    vi.mocked(userService.createUser).mockResolvedValueOnce({
      id: "staff-new-99",
      first_name: "Sarah",
      last_name: "Connor",
      full_name: "Sarah Connor",
      email: "sarah.c@neurocommerce.ai",
      user_type: "staff",
      is_active: true,
      created_at: "2026-08-22T00:00:00Z",
    });

    render(<CreateStaffPage />);

    fireEvent.change(screen.getByLabelText(/first name \*/i), { target: { value: "Sarah" } });
    fireEvent.change(screen.getByLabelText(/last name \*/i), { target: { value: "Connor" } });
    fireEvent.change(screen.getByLabelText(/work email \*/i), { target: { value: "sarah.c@neurocommerce.ai" } });
    fireEvent.change(screen.getByLabelText(/initial password \*/i), { target: { value: "StrongPass123!" } });
    fireEvent.change(screen.getByLabelText(/employee id \*/i), { target: { value: "EMP-2026-99" } });

    fireEvent.click(screen.getByRole("button", { name: /onboard staff/i }));

    await waitFor(() => {
      expect(userService.createUser).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/admin/staff/staff-new-99");
    });
  });
});
