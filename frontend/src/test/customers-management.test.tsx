import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import AdminCustomersPage from "@/app/(admin)/admin/customers/page";
import CustomerDetailPage from "@/app/(admin)/admin/customers/[id]/page";
import { useUsers, useUser, useUpdateUserStatus } from "@/hooks/use-users";
import { UserItem, UserDetail } from "@/services/user-service";

vi.mock("@/hooks/use-users", () => ({
  useUsers: vi.fn(),
  useUser: vi.fn(),
  useUpdateUserStatus: vi.fn(),
}));

const mockCustomer: UserItem = {
  id: "cust-1",
  first_name: "Elena",
  last_name: "Rostova",
  full_name: "Elena Rostova",
  email: "elena@example.com",
  phone: "+1 555 234 5678",
  user_type: "customer",
  is_active: true,
  email_verified_at: "2026-08-20T00:00:00Z",
  created_at: "2026-08-20T00:00:00Z",
  profile: {
    customer_group: "vip",
    total_spent: 1250,
    total_orders: 4,
  },
};

const mockCustomerDetail: UserDetail = {
  ...mockCustomer,
  addresses: [
    {
      id: "addr-1",
      first_name: "Elena",
      last_name: "Rostova",
      address_line_1: "742 Evergreen Terrace",
      city: "Springfield",
      state: "OR",
      postal_code: "97477",
      country_code: "US",
      is_default: true,
    },
  ],
};

describe("Admin Customer Management Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateUserStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("renders customer directory table with customers", () => {
    vi.mocked(useUsers).mockReturnValue({
      data: {
        data: [mockCustomer],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminCustomersPage />);

    expect(screen.getByText("Elena Rostova")).toBeInTheDocument();
    expect(screen.getByText("elena@example.com")).toBeInTheDocument();
    expect(screen.getByText("+1 555 234 5678")).toBeInTheDocument();
    expect(screen.getByText("vip")).toBeInTheDocument();
  });

  it("renders customer profile detail with address and lifetime spend", async () => {
    vi.mocked(useUser).mockReturnValue({
      data: mockCustomerDetail,
      isLoading: false,
      isError: false,
    } as any);

    await act(async () => {
      render(<CustomerDetailPage params={Promise.resolve({ id: "cust-1" })} />);
    });

    expect(screen.getByRole("heading", { name: "Elena Rostova" })).toBeInTheDocument();
    expect(screen.getByText("742 Evergreen Terrace")).toBeInTheDocument();
    expect(screen.getByText("Springfield, OR 97477")).toBeInTheDocument();
    expect(screen.getByText("₦1,250.00")).toBeInTheDocument();
  });
});
