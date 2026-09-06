import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SalesRevenueChart } from "@/components/dashboard/sales-revenue-chart";
import { SalesChartPoint } from "@/services/dashboard-service";

const mockSalesData: SalesChartPoint[] = [
  { date: "2026-08-01", orders: 12, revenue: 1500 },
  { date: "2026-08-02", orders: 18, revenue: 2400 },
  { date: "2026-08-03", orders: 15, revenue: 1950 },
];

describe("Dashboard Sales & Revenue Chart Component", () => {
  it("renders loading skeletons when isLoading is true", () => {
    const { container } = render(
      <SalesRevenueChart isLoading={true} isError={false} periodLabel="Last 30 Days" />
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders empty state when data array is empty", () => {
    render(
      <SalesRevenueChart data={[]} isLoading={false} isError={false} periodLabel="Last 30 Days" />
    );
    expect(screen.getByText(/no sales data available/i)).toBeInTheDocument();
  });

  it("renders SVG chart, title and formatted period revenue", () => {
    const { container } = render(
      <SalesRevenueChart
        data={mockSalesData}
        isLoading={false}
        isError={false}
        periodLabel="Last 30 Days"
      />
    );

    expect(screen.getByText(/sales & revenue curve/i)).toBeInTheDocument();
    expect(screen.getByText(/total: ₦5,850\.00 across 45 orders/i)).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelectorAll("circle").length).toBe(3);
  });
});
