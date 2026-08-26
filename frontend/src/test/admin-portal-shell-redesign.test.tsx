import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminLayout from "@/app/(admin)/layout";
import AdminDashboardPage from "@/app/(admin)/admin/dashboard/page";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import {
  useDashboardSummary,
  useSalesChart,
  useRecentOrders,
  useTopProducts,
  useLowStock,
} from "@/hooks/use-dashboard";
import { useAuthStore } from "@/stores/auth-store";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  })),
  usePathname: vi.fn(() => "/admin/dashboard"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("@/components/auth/protected-route", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-protected-route">{children}</div>,
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/hooks/use-dashboard", () => ({
  useDashboardSummary: vi.fn(),
  useSalesChart: vi.fn(),
  useRecentOrders: vi.fn(),
  useTopProducts: vi.fn(),
  useLowStock: vi.fn(),
  DASHBOARD_QUERY_KEYS: {
    summary: ["dashboard", "summary"],
    salesChart: (period: string) => ["dashboard", "salesChart", period],
    recentOrders: (limit: number) => ["dashboard", "recentOrders", limit],
    topProducts: (limit: number) => ["dashboard", "topProducts", limit],
    lowStock: (limit: number) => ["dashboard", "lowStock", limit],
  },
}));

const mockSummary = {
  revenue: { total: 12500000, this_month: 2350000 },
  orders: { total: 1420, this_month: 185 },
  customers: { total: 890, new_this_month: 42 },
  products: { total: 156, active: 148 },
};

const mockChartData = [
  { date: "2026-08-01", revenue: 50000, orders: 8 },
  { date: "2026-08-02", revenue: 75000, orders: 12 },
  { date: "2026-08-03", revenue: 62000, orders: 10 },
];

const mockRecentOrders = [
  {
    id: "ord-1",
    order_number: "ORD-2026-9001",
    total_amount: 149900,
    status: "paid",
    status_label: "Paid",
    created_at: "2026-08-24T12:00:00Z",
    items: [{ id: "item-1", quantity: 2 }],
    user: { id: "u-1", first_name: "Sarah", last_name: "Connor", email: "sarah@cyberdyne.lab" },
  },
];

const mockTopProducts = [
  {
    id: "prod-1",
    name: "Neural Interface V2 Pro",
    price: 499900,
    total_sold: 142,
    category: { id: "cat-1", name: "Interfaces" },
  },
];

const mockLowStock = [
  {
    id: "prod-2",
    name: "EEG Wireless Dry Cap",
    sku: "EEG-CAP-DRY",
    stock_quantity: 3,
    stock_status: "low_stock",
    category: { id: "cat-2", name: "Headsets" },
  },
];

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("Admin Portal Shell & Executive Dashboard Suite (STEP 27.1)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockAuthState = {
      user: { id: "adm-1", first_name: "John", last_name: "Doe", email: "admin@neurocommerce.ai", role: "admin" },
      isAuthenticated: true,
      logout: vi.fn(),
    };

    vi.mocked(useAuthStore).mockImplementation((selector?: any) => {
      return typeof selector === "function" ? selector(mockAuthState) : mockAuthState;
    });

    vi.mocked(useDashboardSummary).mockReturnValue({
      data: mockSummary,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useSalesChart).mockReturnValue({
      data: mockChartData,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useRecentOrders).mockReturnValue({
      data: mockRecentOrders,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useTopProducts).mockReturnValue({
      data: mockTopProducts,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useLowStock).mockReturnValue({
      data: mockLowStock,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it("1. Admin Root Layout: renders protected shell, sidebar, topbar, and children", () => {
    renderWithQueryClient(
      <AdminLayout>
        <div data-testid="admin-content">Admin Content</div>
      </AdminLayout>
    );

    expect(screen.getByTestId("admin-protected-route")).toBeInTheDocument();
    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });

  it("2. Sidebar Navigation: renders navigation groups and active state", () => {
    renderWithQueryClient(<AdminSidebar />);

    expect(screen.getByText("OVERVIEW")).toBeInTheDocument();
    expect(screen.getByText("COMMERCE")).toBeInTheDocument();
    expect(screen.getByText("MARKETING")).toBeInTheDocument();
    expect(screen.getByText("CONTENT & MEDIA")).toBeInTheDocument();
    expect(screen.getByText("GOVERNANCE")).toBeInTheDocument();
    expect(screen.getByText("CONFIGURATION")).toBeInTheDocument();

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Customers")).toBeInTheDocument();
    expect(screen.getByText("Coupons")).toBeInTheDocument();
    expect(screen.getByText("Reviews")).toBeInTheDocument();
    expect(screen.getByText("CMS Pages")).toBeInTheDocument();
    expect(screen.getByText("Staff")).toBeInTheDocument();
    expect(screen.getByText("Audit Logs")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("3. Admin Topbar: renders search input, system status, and user menus", () => {
    renderWithQueryClient(<AdminTopbar />);

    expect(screen.getByPlaceholderText(/Global search/i)).toBeInTheDocument();
    expect(screen.getByText("System Operational")).toBeInTheDocument();
    expect(screen.getByText("Storefront")).toBeInTheDocument();
  });

  it("4. Executive Dashboard Greeting & Breadcrumb: renders administrator name and operational context", () => {
    renderWithQueryClient(<AdminDashboardPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("COMMERCIAL OPERATIONS CENTER")).toBeInTheDocument();
    expect(screen.getByText(/Welcome, John/i)).toBeInTheDocument();
  });

  it("5. Dashboard Filter Bar: renders timeframe selector and telemetry refresh button", () => {
    renderWithQueryClient(<AdminDashboardPage />);

    expect(screen.getByText("Last 30 Days")).toBeInTheDocument();
    expect(screen.getByText("Last 12 Weeks")).toBeInTheDocument();
    expect(screen.getByText("Last 12 Months")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh telemetry/i })).toBeInTheDocument();
  });

  it("6. KPI Cards: renders authoritative total revenue, orders, customers, and catalog SKUs", () => {
    renderWithQueryClient(<AdminDashboardPage />);

    expect(screen.getByText("TOTAL REVENUE")).toBeInTheDocument();
    expect(screen.getByText("TOTAL ORDERS")).toBeInTheDocument();
    expect(screen.getByText("ACTIVE CUSTOMERS")).toBeInTheDocument();
    expect(screen.getByText("CATALOG SKUS")).toBeInTheDocument();

    expect(screen.getByText("1,420")).toBeInTheDocument();
    expect(screen.getByText("890")).toBeInTheDocument();
    expect(screen.getByText("156")).toBeInTheDocument();
  });

  it("7. Sales Revenue Curve & Top Products: renders chart header and ranked products", () => {
    renderWithQueryClient(<AdminDashboardPage />);

    expect(screen.getByText(/Sales & Revenue Curve/i)).toBeInTheDocument();
    expect(screen.getByText("Top Performing Products")).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText("142")).toBeInTheDocument();
  });

  it("8. Low Stock & Recent Orders: renders low stock items and recent orders stream", () => {
    renderWithQueryClient(<AdminDashboardPage />);

    expect(screen.getByText("Low Stock Alerts")).toBeInTheDocument();
    expect(screen.getByText("EEG Wireless Dry Cap")).toBeInTheDocument();
    expect(screen.getByText("3 left")).toBeInTheDocument();

    expect(screen.getByText("Recent Orders Stream")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-9001")).toBeInTheDocument();
    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
  });
});
