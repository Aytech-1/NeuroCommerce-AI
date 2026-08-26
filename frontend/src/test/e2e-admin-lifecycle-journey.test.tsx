import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DashboardPage from "@/app/(admin)/admin/dashboard/page";
import ProductsListPage from "@/app/(admin)/admin/products/page";
import OrdersPage from "@/app/(admin)/admin/orders/page";
import StaffPage from "@/app/(admin)/admin/staff/page";
import AuditLogsPage from "@/app/(admin)/admin/audit-logs/page";
import { useAuthStore } from "@/stores/auth-store";
import {
  useDashboardSummary,
  useSalesChart,
  useRecentOrders,
  useTopProducts,
  useLowStock,
} from "@/hooks/use-dashboard";
import { useProducts, useDeleteProduct, useCategories, useBrands, useUpdateProductStatus } from "@/hooks/use-catalog";
import { useOrders } from "@/hooks/use-orders";
import { useUsers, useUpdateUserStatus } from "@/hooks/use-users";
import { useAuditLogs } from "@/hooks/use-audit";

vi.mock("@/hooks/use-dashboard", () => ({
  useDashboardSummary: vi.fn(),
  useSalesChart: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useRecentOrders: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useTopProducts: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useLowStock: vi.fn().mockReturnValue({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/use-catalog", () => ({
  useProducts: vi.fn(),
  useCategories: vi.fn().mockReturnValue({ data: [] }),
  useBrands: vi.fn().mockReturnValue({ data: [] }),
  useDeleteProduct: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useUpdateProductStatus: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useAdminCategories: vi.fn().mockReturnValue({ data: [] }),
  useAdminBrands: vi.fn().mockReturnValue({ data: [] }),
}));

vi.mock("@/hooks/use-orders", () => ({
  useOrders: vi.fn(),
}));

vi.mock("@/hooks/use-users", () => ({
  useUsers: vi.fn(),
  useUpdateUserStatus: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@/hooks/use-audit", () => ({
  useAuditLogs: vi.fn(),
}));

describe("End-to-End Admin Management Lifecycle Suite", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    useAuthStore.setState({
      user: {
        id: "admin-1",
        first_name: "Root",
        last_name: "Administrator",
        email: "admin@neurocommerce.ai",
        role: "admin",
        is_active: true,
        created_at: "2026-08-20T00:00:00Z",
      },
      token: "mock-admin-token",
      isAuthenticated: true,
    });

    vi.mocked(useDashboardSummary).mockReturnValue({
      data: {
        revenue: { total: 1245000.0, this_month: 98000.0 },
        orders: { total: 842, this_month: 64 },
        customers: { total: 318, new_this_month: 22 },
        products: { total: 145, active: 138 },
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useProducts).mockReturnValue({
      data: {
        data: [
          {
            id: "p-1",
            name: "Neural Interface V2 Pro",
            sku: "NIV2-PRO",
            base_price: 549.99,
            status: "active",
            is_active: true,
            created_at: "2026-08-20T00:00:00Z",
            updated_at: "2026-08-20T00:00:00Z",
          },
        ],
        meta: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useOrders).mockReturnValue({
      data: {
        data: [
          {
            id: "ord-1",
            order_number: "ORD-2026-0001",
            status: "paid",
            status_label: "Paid",
            currency_code: "USD",
            total_amount: 549.99,
            item_count: 1,
            created_at: "2026-08-20T00:00:00Z",
            updated_at: "2026-08-20T00:00:00Z",
          },
        ],
        meta: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useUsers).mockReturnValue({
      data: {
        data: [
          {
            id: "st-1",
            first_name: "Dr. Elena",
            last_name: "Rostova",
            full_name: "Dr. Elena Rostova",
            email: "elena@neurocommerce.ai",
            user_type: "staff",
            roles: ["catalog_manager"],
            is_active: true,
            created_at: "2026-08-20T00:00:00Z",
          },
        ],
        meta: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useAuditLogs).mockReturnValue({
      data: {
        data: [
          {
            id: "aud-1",
            event: "product.updated",
            auditable_type: "App\\Modules\\Catalog\\Models\\Product",
            auditable_id: "p-1",
            user: { name: "Root Administrator", email: "admin@neurocommerce.ai" },
            ip_address: "127.0.0.1",
            user_agent: "Mozilla/5.0",
            created_at: "2026-08-20T00:00:00Z",
          },
        ],
        meta: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);
  });

  it("1. Admin Dashboard: renders authoritative laboratory metrics and KPI cards", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );
    expect(screen.getByText("$1,245,000.00")).toBeInTheDocument();
    expect(screen.getByText("842")).toBeInTheDocument();
    expect(screen.getByText("318")).toBeInTheDocument();
  });

  it("2. Catalog Management: lists products with SKU and pricing", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ProductsListPage />
      </QueryClientProvider>
    );
    expect(screen.getByText("Product Catalog")).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText("NIV2-PRO")).toBeInTheDocument();
  });

  it("3. Order Operations: renders laboratory order registry with fulfillment status", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <OrdersPage />
      </QueryClientProvider>
    );
    expect(screen.getByText("Orders & Fulfillment")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("$549.99")).toBeInTheDocument();
  });

  it("4. Staff & RBAC Governance: lists active laboratory personnel", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <StaffPage />
      </QueryClientProvider>
    );
    expect(screen.getByText("Staff & Administrative Team")).toBeInTheDocument();
    expect(screen.getByText("Dr. Elena Rostova")).toBeInTheDocument();
    expect(screen.getByText("catalog manager")).toBeInTheDocument();
  });

  it("5. Audit & Compliance Trail: records immutable system mutations", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuditLogsPage />
      </QueryClientProvider>
    );
    expect(screen.getByText("Security & Regulatory Audit Trail")).toBeInTheDocument();
    expect(screen.getByText("product.updated")).toBeInTheDocument();
    expect(screen.getByText("127.0.0.1")).toBeInTheDocument();
  });
});
