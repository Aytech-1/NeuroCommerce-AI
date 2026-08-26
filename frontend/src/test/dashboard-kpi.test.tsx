import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { DashboardSummary } from "@/services/dashboard-service";

const mockSummary: DashboardSummary = {
  revenue: {
    total: 125000,
    this_month: 32000,
  },
  orders: {
    total: 1450,
    this_month: 380,
  },
  customers: {
    total: 4200,
    new_this_month: 290,
  },
  products: {
    total: 512,
    active: 490,
  },
};

describe("Dashboard KPI Cards Component", () => {
  it("renders loading skeletons when isLoading is true", () => {
    const { container } = render(<KpiCards isLoading={true} isError={false} />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error state with retry button when isError is true", () => {
    const handleRetry = vi.fn();
    render(<KpiCards isLoading={false} isError={true} onRetry={handleRetry} />);

    expect(screen.getByText(/failed to load kpi metrics/i)).toBeInTheDocument();
    const retryButton = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryButton);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders all 4 KPI cards with formatted values from backend data", () => {
    render(<KpiCards summary={mockSummary} isLoading={false} isError={false} />);

    // Total Revenue
    expect(screen.getByText(/total revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/\$125,000/i)).toBeInTheDocument();
    expect(screen.getByText(/\$32,000/i)).toBeInTheDocument();

    // Total Orders
    expect(screen.getByText(/total orders/i)).toBeInTheDocument();
    expect(screen.getByText("1,450")).toBeInTheDocument();

    // Active Customers
    expect(screen.getByText(/active customers/i)).toBeInTheDocument();
    expect(screen.getByText("4,200")).toBeInTheDocument();

    // Catalog SKUs
    expect(screen.getByText(/catalog skus/i)).toBeInTheDocument();
    expect(screen.getByText("512")).toBeInTheDocument();
  });
});
