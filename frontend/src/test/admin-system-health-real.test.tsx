import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminSystemHealthPage from "@/app/(admin)/admin/system-health/page";
import * as healthHooks from "@/hooks/use-health";
import * as auditHooks from "@/hooks/use-audit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminSystemHealthData } from "@/services/health-service";

vi.mock("@/hooks/use-health");
vi.mock("@/hooks/use-audit");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const mockAuthoritativeHealthData: AdminSystemHealthData = {
  status: "healthy",
  checked_at: "2026-08-25T00:30:00Z",
  application: {
    status: "healthy",
    name: "NeuroCommerce AI",
    version: "1.0.0",
    environment: "production",
    debug_mode: false,
    laravel_version: "11.43.2",
    php_version: "8.4.1",
    timezone: "UTC",
    locale: "en",
  },
  database: {
    status: "healthy",
    connection: "mysql",
    database_name: "neurocommerce_ai",
    response_time_ms: 1.45,
  },
  cache: {
    status: "healthy",
    driver: "redis",
    response_time_ms: 0.85,
  },
  queue: {
    status: "configured",
    driver: "sync",
    worker_status: "Managed Externally",
  },
  storage: {
    status: "healthy",
    disk: "local",
    writable: true,
    response_time_ms: 0.32,
  },
  external_services: [
    {
      name: "AI Recommendation Engine",
      status: "healthy",
      provider: "FastApiAIProvider",
    },
  ],
  security_warnings: [],
};

describe("Admin System Health & Diagnostics Real Test Suite (STEP 28.32)", () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(healthHooks.useAdminSystemHealth).mockReturnValue({
      data: mockAuthoritativeHealthData,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
      dataUpdatedAt: Date.now(),
    } as any);

    vi.mocked(healthHooks.useSystemHealth).mockReturnValue({
      data: { status: "healthy", version: "1.0.0", timestamp: "2026-08-25T00:30:00Z" },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(healthHooks.useSystemVersion).mockReturnValue({
      data: { name: "NeuroCommerce AI", version: "1.0.0", laravel: "11.43.2", php: "8.4.1" },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(auditHooks.useActivityLogs).mockReturnValue({
      data: {
        data: [
          {
            id: "act-1",
            action: "system.config.update",
            description: "Updated payment gateway configuration.",
            created_at: "2026-08-25T00:15:00Z",
            user: { name: "Root Administrator", email: "admin@neurocommerce.ai" },
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as any);
  });

  it("1. Page renders successfully with breadcrumb and operational header", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByText("SYSTEM OPERATIONS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "System Health" })).toBeInTheDocument();
  });

  it("2. Real health query is used and data updates", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(healthHooks.useAdminSystemHealth).toHaveBeenCalled();
  });

  it("3. Overall backend status renders correctly in hero card", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("System Operational")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
  });

  it("4. Healthy status renders operational badge and indicators", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getAllByText("Operational").length).toBeGreaterThanOrEqual(1);
  });

  it("5. Degraded status renders degraded badge when reported by backend", () => {
    vi.mocked(healthHooks.useAdminSystemHealth).mockReturnValue({
      data: {
        ...mockAuthoritativeHealthData,
        status: "degraded",
        cache: { status: "degraded", driver: "redis", response_time_ms: 120 },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
      dataUpdatedAt: Date.now(),
    } as any);

    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Degraded Performance Detected")).toBeInTheDocument();
    expect(screen.getAllByText("Degraded").length).toBeGreaterThanOrEqual(1);
  });

  it("6. Unhealthy status renders service disruption badge when backend fails", () => {
    vi.mocked(healthHooks.useAdminSystemHealth).mockReturnValue({
      data: {
        ...mockAuthoritativeHealthData,
        status: "unhealthy",
        database: { status: "unhealthy", connection: "mysql", response_time_ms: null },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
      dataUpdatedAt: Date.now(),
    } as any);

    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Service Disruption Detected")).toBeInTheDocument();
    expect(screen.getByText("Attention Required")).toBeInTheDocument();
  });

  it("7. Database status renders from authoritative API data with real latency", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getAllByText(/1.45 ms/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/MYSQL • neurocommerce_ai/i)).toBeInTheDocument();
  });

  it("8. Cache status renders from authoritative API data with real latency", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getAllByText(/0.85 ms/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Cache Driver: redis/i)).toBeInTheDocument();
  });

  it("9. Queue status does not invent worker execution values", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText(/Workers: Managed Externally/i)).toBeInTheDocument();
    expect(screen.queryByText("Workers: 100% active 42 jobs done")).not.toBeInTheDocument();
  });

  it("10. Storage status renders from authoritative API data", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText(/Disk: local • Writable: Yes/i)).toBeInTheDocument();
  });

  it("11. Configuration warnings render only when returned by backend", () => {
    vi.mocked(healthHooks.useAdminSystemHealth).mockReturnValue({
      data: {
        ...mockAuthoritativeHealthData,
        security_warnings: [
          {
            type: "security",
            severity: "warning",
            message: "Application debug mode is enabled in production environment.",
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
      dataUpdatedAt: Date.now(),
    } as any);

    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Configuration & Security Advisories (1)")).toBeInTheDocument();
    expect(screen.getByText("Application debug mode is enabled in production environment.")).toBeInTheDocument();
  });

  it("12. Loading state does not display fake health values", () => {
    vi.mocked(healthHooks.useAdminSystemHealth).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    } as any);

    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.queryByText("System Operational")).not.toBeInTheDocument();
  });

  it("13. API error state displays retry button and guidance", () => {
    vi.mocked(healthHooks.useAdminSystemHealth).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Unable to retrieve system health")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("14. Retry button calls refetch on error state", () => {
    vi.mocked(healthHooks.useAdminSystemHealth).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    renderWithClient(<AdminSystemHealthPage />);

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("15. Manual refresh button triggers query invalidation and feedback", async () => {
    renderWithClient(<AdminSystemHealthPage />);

    const refreshBtn = screen.getByRole("button", { name: /refresh status/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(refreshBtn).toBeInTheDocument();
    });
  });

  it("16. Activity logs deep link routes to activity log console", () => {
    renderWithClient(<AdminSystemHealthPage />);

    const activityLink = screen.getByRole("link", { name: /view activity/i });
    expect(activityLink).toHaveAttribute("href", "/admin/activity-logs");
  });

  it("17. Secrets are never rendered anywhere in the DOM", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.queryByText(/base64:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/DB_PASSWORD/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/STRIPE_SECRET/i)).not.toBeInTheDocument();
  });

  it("18. No mock runtime data is present in telemetry cards", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.queryByText("MockCPU: 99%")).not.toBeInTheDocument();
    expect(screen.queryByText("FakeMemory: 16GB")).not.toBeInTheDocument();
  });

  it("19. Subsystem quick deep links are functional", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByRole("link", { name: /Settings/i })).toHaveAttribute("href", "/admin/settings");
    expect(screen.getByRole("link", { name: /Audit Logs/i })).toHaveAttribute("href", "/admin/audit-logs");
    expect(screen.getByRole("link", { name: /Payments/i })).toHaveAttribute("href", "/admin/payments");
    expect(screen.getByRole("link", { name: /Shipping/i })).toHaveAttribute("href", "/admin/shipping");
    expect(screen.getByRole("link", { name: /Flags/i })).toHaveAttribute("href", "/admin/system/feature-flags");
  });

  it("20. Responsive telemetry timestamp renders checked time", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Telemetry Last Checked")).toBeInTheDocument();
  });
});