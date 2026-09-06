import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import AdminFinancePage from "@/app/(admin)/admin/finance/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import * as financeHooks from "@/hooks/use-finance";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/admin/finance",
}));

// Mock Can component
vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock window.URL
if (typeof window !== "undefined") {
  window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
  window.URL.revokeObjectURL = vi.fn();
}

// Authoritative Mock Data
const mockSummaryData = {
  total_revenue: 1250000,
  net_revenue: 1100000,
  total_tax: 82500,
  total_shipping: 25000,
  total_discounts: 15000,
  total_orders: 85,
  avg_order_value: 14705.88,
  total_items_sold: 142,
  refund_count: 2,
  refund_amount: 18500,
};

const mockChartData = {
  granularity: "daily",
  labels: ["2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04"],
  datasets: [
    {
      label: "Revenue",
      data: [250000, 310000, 420000, 270000],
    },
    {
      label: "Orders",
      data: [15, 22, 28, 20],
    },
  ],
};

const mockCategoryBreakdown = [
  { id: "cat-1", name: "Smart Wearables", revenue: 750000, units_sold: 45 },
  { id: "cat-2", name: "Audio Gear", revenue: 500000, units_sold: 97 },
];

const mockBrandBreakdown = [
  { id: "brd-1", name: "NeuroFit", revenue: 800000, units_sold: 60 },
  { id: "brd-2", name: "AcousticLab", revenue: 450000, units_sold: 82 },
];

const mockTaxReport = [
  {
    currency_code: "NGN",
    total_taxable_orders: 85,
    taxable_amount: 1100000,
    tax_collected: 82500,
  },
  {
    currency_code: "USD",
    total_taxable_orders: 12,
    taxable_amount: 2400,
    tax_collected: 180,
  },
];

const mockInventoryValuation = {
  summary: {
    total_products: 48,
    total_units_in_stock: 520,
    total_cost_valuation: 14500000,
    total_retail_valuation: 26000000,
    potential_profit: 11500000,
  },
  items: [
    {
      id: "prod-1",
      sku: "NFS-HW-001",
      name: "NeuroFit Sense Smart Health Watch",
      base_price: 185000,
      cost_price: 110000,
      quantity: 40,
      total_cost_value: 4400000,
      total_retail_value: 7400000,
    },
  ],
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe("Admin Finance & Accounting Dashboard (STEP 28.23)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(financeHooks, "useFinanceSalesSummary").mockReturnValue({
      data: mockSummaryData,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(financeHooks, "useFinanceSalesChart").mockReturnValue({
      data: mockChartData,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(financeHooks, "useFinanceRevenueByCategory").mockReturnValue({
      data: mockCategoryBreakdown,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(financeHooks, "useFinanceRevenueByBrand").mockReturnValue({
      data: mockBrandBreakdown,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(financeHooks, "useFinanceTaxReport").mockReturnValue({
      data: mockTaxReport,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(financeHooks, "useFinanceInventoryValuation").mockReturnValue({
      data: mockInventoryValuation,
      isLoading: false,
      isFetching: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(financeHooks, "useExportOrdersMutation").mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(new Blob(["mock-csv-data"], { type: "text/csv" })),
      isPending: false,
    } as any);
  });

  it("1. Renders finance dashboard header and authoritative disclosure notice", () => {
    renderWithClient(<AdminFinancePage />);

    expect(screen.getByText(/Finance & Accounting Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/AUTHORITATIVE FINANCIAL RECONCILIATION/i)).toBeInTheDocument();
    expect(screen.getByText(/Authoritative Ledger Notice:/i)).toBeInTheDocument();
  });

  it("2. Renders all 6 core financial KPI cards with authoritative metrics", () => {
    renderWithClient(<AdminFinancePage />);

    expect(screen.getByText("Gross Revenue")).toBeInTheDocument();
    expect(screen.getByText("Net Sales")).toBeInTheDocument();
    expect(screen.getByText("Tax Collected")).toBeInTheDocument();
    expect(screen.getByText("Shipping")).toBeInTheDocument();
    expect(screen.getByText("Discounts")).toBeInTheDocument();
    expect(screen.getByText("Refunds")).toBeInTheDocument();
    expect(screen.getByText(/85 Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/2 Refund claims/i)).toBeInTheDocument();
  });

  it("3. Renders date preset options and switches active preset", async () => {
    renderWithClient(<AdminFinancePage />);

    const btn7d = screen.getByRole("button", { name: "7 Days" });
    const btnToday = screen.getByRole("button", { name: "Today" });
    const btn30d = screen.getByRole("button", { name: "30 Days" });

    expect(btn7d).toBeInTheDocument();
    expect(btnToday).toBeInTheDocument();
    expect(btn30d).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(btn7d);
    });

    expect(btn7d.className).toContain("bg-slate-900");
  });

  it("4. Renders revenue and order volume trend chart series", () => {
    renderWithClient(<AdminFinancePage />);

    expect(screen.getByText(/Revenue & Order Volume Trend/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-08-01/i)).toBeInTheDocument();
    expect(screen.getByText(/2026-08-02/i)).toBeInTheDocument();
  });

  it("5. Renders Category and Brand revenue distributions with percentages", () => {
    renderWithClient(<AdminFinancePage />);

    expect(screen.getByText("Smart Wearables")).toBeInTheDocument();
    expect(screen.getByText("Audio Gear")).toBeInTheDocument();
    expect(screen.getByText("NeuroFit")).toBeInTheDocument();
    expect(screen.getByText("AcousticLab")).toBeInTheDocument();
  });

  it("6. Switches to Tax Remittance Ledger tab and displays multi-currency table", async () => {
    renderWithClient(<AdminFinancePage />);

    const taxTab = screen.getByRole("button", { name: /Tax Remittance Ledger/i });
    await act(async () => {
      fireEvent.click(taxTab);
    });

    expect(screen.getByText(/Tax Collection by Currency Ledger/i)).toBeInTheDocument();
    expect(screen.getByText("NGN")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("7. Switches to Inventory Cost & Asset Valuation tab and renders valuation metrics", async () => {
    renderWithClient(<AdminFinancePage />);

    const inventoryTab = screen.getByRole("button", { name: /Inventory Cost & Asset Valuation/i });
    await act(async () => {
      fireEvent.click(inventoryTab);
    });

    expect(screen.getByText(/Inventory Cost & Asset Valuation Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/48 SKUs/i)).toBeInTheDocument();
    expect(screen.getByText(/Cost of Goods on Hand \(COGS Asset\)/i)).toBeInTheDocument();
    expect(screen.getByText("NeuroFit Sense Smart Health Watch")).toBeInTheDocument();
  });

  it("8. Executes Orders CSV export action cleanly", async () => {
    renderWithClient(<AdminFinancePage />);

    const exportBtn = screen.getByRole("button", { name: /Export Orders CSV/i });
    expect(exportBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(exportBtn);
    });

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });
});
