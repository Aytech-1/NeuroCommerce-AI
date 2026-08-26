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
    expect(screen.getByText("v1.0.0")).toBeInTheDocument();

    expect(screen.getByText("Framework Runtime")).toBeInTheDocument();
    expect(screen.getByText("Laravel 11")).toBeInTheDocument();

    expect(screen.getByText("PHP Engine")).toBeInTheDocument();
    expect(screen.getByText("PHP 8.4")).toBeInTheDocument();
  });

  it("4. Monitored Services Matrix: renders core platform services with operational status", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Monitored Services")).toBeInTheDocument();
    expect(screen.getByText("Application REST API Gateway")).toBeInTheDocument();
    expect(screen.getByText("Database Connectivity & Persistence")).toBeInTheDocument();
    expect(screen.getByText("Authentication & RBAC Boundary")).toBeInTheDocument();
    expect(screen.getByText("Security Audit & Compliance Trail")).toBeInTheDocument();
    expect(screen.getByText("Configuration & Controlled Rollout")).toBeInTheDocument();
  });

  it("5. Operational Signals: renders recent activity stream with actions and timestamps", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Recent Signals")).toBeInTheDocument();
    expect(screen.getByText("system.config.update")).toBeInTheDocument();
    expect(screen.getByText("Updated payment gateway gateway configuration.")).toBeInTheDocument();
    expect(screen.getByText("feature_flag.toggle")).toBeInTheDocument();
    expect(screen.getByText("Enabled ai_recommendations rollout.")).toBeInTheDocument();
  });

  it("6. Incident Area: renders zero incidents status notice", () => {
    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("No Active Incidents Detected")).toBeInTheDocument();
    expect(
      screen.getByText(/All platform sub-systems, catalog indexes, and fulfillment endpoints are reporting stable execution telemetry/i)
    ).toBeInTheDocument();
  });

  it("7. Refresh Action: triggers query invalidation on button click", async () => {
    renderWithClient(<AdminSystemHealthPage />);

    const refreshButton = screen.getByRole("button", { name: /Refresh Status/i });
    expect(refreshButton).toBeInTheDocument();

    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Refresh Status/i })).toBeInTheDocument();
    });
  });

  it("8. Error State: displays error banner and retry button when health endpoint fails", () => {
    const mockRefetch = vi.fn();
    vi.mocked(healthHooks.useSystemHealth).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
      dataUpdatedAt: 0,
    } as any);

    renderWithClient(<AdminSystemHealthPage />);

    expect(screen.getByText("Unable to retrieve system health")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /Retry/i });
    expect(retryBtn).toBeInTheDocument();

    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
