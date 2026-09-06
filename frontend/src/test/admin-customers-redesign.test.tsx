import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AdminCustomersPage from "@/app/(admin)/admin/customers/page";
import CustomerDetailPage from "@/app/(admin)/admin/customers/[id]/page";
import { useUsers, useUser, useUpdateUserStatus } from "@/hooks/use-users";
import { UserItem, UserDetail } from "@/services/user-service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/customers",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/use-users", () => ({
  useUsers: vi.fn(),
  useUser: vi.fn(),
  useUpdateUserStatus: vi.fn(),
}));

const mockCustomersList: UserItem[] = [
  {
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
  },
  {
    id: "cust-2",
    first_name: "Alexander",
    last_name: "Wright",
    full_name: "Alexander Wright",
    email: "alex@biotech.org",
    phone: "+1 555 987 6543",
    user_type: "customer",
    is_active: false,
    email_verified_at: null,
    created_at: "2026-08-21T00:00:00Z",
    profile: {
      customer_group: "enterprise",
      total_spent: 8500,
      total_orders: 12,
    },
  },
];

const mockCustomerDetail: UserDetail = {
  ...mockCustomersList[0],
  last_login_at: "2026-08-24T12:00:00Z",
  addresses: [
    {
      id: "addr-1",
      first_name: "Elena",
      last_name: "Rostova",
      address_line_1: "742 Evergreen Terrace",
      address_line_2: "Building B",
      city: "Springfield",
      state: "OR",
      postal_code: "97477",
      country_code: "US",
      is_default: true,
    },
  ],
};

describe("Admin Customer Management & Customer 360 Suite (STEP 27.6)", () => {
  const mockUpdateStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUsers).mockReturnValue({
      data: {
        data: mockCustomersList,
        meta: { current_page: 1, per_page: 15, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useUser).mockReturnValue({
      data: mockCustomerDetail,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useUpdateUserStatus).mockReturnValue({
      mutateAsync: mockUpdateStatus,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and breadcrumb navigation", () => {
    render(<AdminCustomersPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("CUSTOMER MANAGEMENT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Customers", level: 1 })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative customer telemetry stats", () => {
    render(<AdminCustomersPage />);

    expect(screen.getByText("Total Customers")).toBeInTheDocument();
    expect(screen.getByText("2 Customers")).toBeInTheDocument();
    expect(screen.getAllByText("Active Accounts").length).toBeGreaterThan(0);
    expect(screen.getByText("1 Active")).toBeInTheDocument();
    expect(screen.getByText("Verified Profiles")).toBeInTheDocument();
    expect(screen.getByText("1 Verified")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search input and renders status select", () => {
    render(<AdminCustomersPage />);

    const searchInput = screen.getByPlaceholderText(/search by name, email, or phone/i);
    fireEvent.change(searchInput, { target: { value: "Elena" } });
    expect(searchInput).toHaveValue("Elena");

    expect(screen.getByText("All Statuses")).toBeInTheDocument();
  });

  it("4. Customers Table: renders customer rows with names, emails, phone numbers, and groups", () => {
    render(<AdminCustomersPage />);

    expect(screen.getByText("Elena Rostova")).toBeInTheDocument();
    expect(screen.getByText("elena@example.com")).toBeInTheDocument();
    expect(screen.getByText("+1 555 234 5678")).toBeInTheDocument();
    expect(screen.getByText("vip")).toBeInTheDocument();

    expect(screen.getByText("Alexander Wright")).toBeInTheDocument();
    expect(screen.getByText("alex@biotech.org")).toBeInTheDocument();
    expect(screen.getByText("enterprise")).toBeInTheDocument();
  });

  it("5. Customer Status Toggle: triggers account activation mutation", () => {
    render(<AdminCustomersPage />);

    const disableBtn = screen.getByRole("button", { name: /^disable$/i });
    fireEvent.click(disableBtn);
    expect(screen.getByText("Deactivate this customer account?")).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: /deactivate customer/i });
    fireEvent.click(confirmBtn);

    expect(mockUpdateStatus).toHaveBeenCalledWith({
      id: "cust-1",
      isActive: false,
    });
  });

  it("6. Customer 360 Detail View: renders profile, address, commercial, and security cards", async () => {
    await act(async () => {
      render(<CustomerDetailPage params={Promise.resolve({ id: "cust-1" })} />);
    });

    expect(screen.getByText("CUSTOMER 360 INTELLIGENCE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Elena Rostova", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("elena@example.com")).toBeInTheDocument();
    expect(screen.getByText("+1 555 234 5678")).toBeInTheDocument();
    expect(screen.getByText("742 Evergreen Terrace")).toBeInTheDocument();
    expect(screen.getByText("Springfield, OR 97477")).toBeInTheDocument();
    expect(screen.getByText("₦1,250.00")).toBeInTheDocument();
    expect(screen.getByText("Account Security")).toBeInTheDocument();
    expect(screen.getByText("Email Verified")).toBeInTheDocument();
  });

  it("7. Empty State: renders empty notice when 0 customers exist", () => {
    vi.mocked(useUsers).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 15, total: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminCustomersPage />);

    expect(screen.getByText("No Customers Found")).toBeInTheDocument();
  });
});
