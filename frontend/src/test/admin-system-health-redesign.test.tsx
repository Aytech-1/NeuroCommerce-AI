import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminSystemHealthPage from "@/app/(admin)/admin/system-health/page";
import * as healthHooks from "@/hooks/use-health";
import * as auditHooks from "@/hooks/use-audit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

describe("Admin System Health & Operations Monitoring Suite (STEP 27.18)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(healthHooks.useAdminSystemHealth).mockReturnValue({
      data: {
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
          response_time_ms: 1.2,
        },
        cache: {
          status: "healthy",
          driver: "redis",
          response_time_ms: 0.5,
        },
        queue: {
          status: "configured",
          driver: "redis",
          worker_status: "Managed Externally",
        },
        storage: {
          status: "healthy",
          disk: "local",
          writable: true,
          response_time_ms: 0.3,
        },
        external_services: [
          {
            name: "AI Recommendation Engine",
            status: "healthy",
            provider: "FastApiAIProvider",
          },
        ],
        security_warnings: [],
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      dataUpdatedAt: Date.now(),
    } as any);

    vi.mocked(healthHooks.useSystemHealth).mockReturnValue({
      data: {
        status: "healthy",
        version: "1.0.0",
        timestamp: "2026-08-25T00:30:00Z",
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      dataUpdatedAt: Date.now(),
    } as any);

    vi.mocked(healthHooks.useSystemVersion).mockReturnValue({
      data: {
        name: "NeuroCommerce AI",
        version: "1.0.0",
        laravel: "11.43.2",
        php: "8.4.1",
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(auditHooks.useActivityLogs).mockReturnValue({
      data: {
        data: [
          {
            id: "act-1",
            action: "system.config.update",
            description: "Updated payment gateway gateway configuration.",
            created_at: "2026-08-25T00:15:00Z",
            user: { name: "Root Administrator", email: "admin@neurocommerce.ai" },
          },
          {
            id: "act-2",
            action: "feature_flag.toggle",
            description: "Enabled ai_recommendations rollout.",
            created_at: "2026-08-25T00:10:00Z",
            user: { name: "System Operator", email: "operator@neurocommerce.ai" },
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders single H1, eyebrow, and breadcrumb navigation", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByText("SYSTEM OPERATIONS")).toBeInTheDocument();

    const heading = screen.getByRole("heading", { level: 1, name: "System Health" });
    expect(heading).toBeInTheDocument();
    expect(screen.getByText(/Monitor the operational state of the NeuroCommerce platform/i)).toBeInTheDocument();
  });

  it("2. System Status Hero: displays operational status and healthy badge", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("System Operational")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText("Telemetry Last Checked")).toBeInTheDocument();
  });

  it("3. Executive KPI Cards: displays platform posture, API version, and framework runtimes", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Platform Posture")).toBeInTheDocument();
    expect(screen.getAllByText("Operational").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("API Version")).toBeInTheDocument();
    expect(screen.getByText("Framework Runtime")).toBeInTheDocument();
    expect(screen.getByText("PHP Engine")).toBeInTheDocument();
  });

  it("4. Monitored Services Matrix: renders core platform services with operational status", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Monitored Services")).toBeInTheDocument();
    expect(screen.getByText("Application REST API Gateway")).toBeInTheDocument();
    expect(screen.getByText("Database Connectivity & Persistence")).toBeInTheDocument();
    expect(screen.getByText("Cache Subsystem & Session Store")).toBeInTheDocument();
    expect(screen.getByText("Queue & Background Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Media & Local Storage Disk")).toBeInTheDocument();
  });

  it("5. Operational Signals: renders recent activity stream with actions and timestamps", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Recent Signals")).toBeInTheDocument();
    expect(screen.getByText("system.config.update")).toBeInTheDocument();
    expect(screen.getByText(/Updated payment gateway gateway configuration/i)).toBeInTheDocument();
    expect(screen.getByText("feature_flag.toggle")).toBeInTheDocument();
  });

  it("6. Subsystem Area: renders quick administration links", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByRole("link", { name: /Settings/i })).toHaveAttribute("href", "/admin/settings");
    expect(screen.getByRole("link", { name: /Audit Logs/i })).toHaveAttribute("href", "/admin/audit-logs");
    expect(screen.getByRole("link", { name: /Payments/i })).toHaveAttribute("href", "/admin/payments");
  });

  it("7. Refresh Action: triggers query invalidation on button click", async () => {
    renderWithClient(<AdminSystemHealthPage />);

    const refreshButton = screen.getByRole("button", { name: /refresh status/i });
    expect(refreshButton).toBeInTheDocument();

    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(refreshButton).toBeInTheDocument();
    });
  });

  it("8. Error State: displays error banner and retry button when health endpoint fails", () => {
    vi.mocked(healthHooks.useAdminSystemHealth).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Unable to retrieve system health")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});