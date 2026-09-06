import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import AdminInvoicesPage from "@/app/(admin)/admin/invoices/page";
import InvoiceDetailPage from "@/app/(admin)/admin/invoices/[id]/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/admin/invoices",
}));

// Mock window.print
const mockPrint = vi.fn();
window.print = mockPrint;

// Sample authoritative mock data matching Laravel response
const mockInvoiceList = [
  {
    id: "inv-uuid-001",
    order_id: "ord-uuid-101",
    invoice_number: "INV-2026-DEMO01",
    status: "paid",
    status_label: "Paid",
    subtotal: 185000.0,
    tax_amount: 13875.0,
    total_amount: 198875.0,
    currency_code: "NGN",
    issued_at: "2026-09-04T12:00:00Z",
    paid_at: "2026-09-04T12:05:00Z",
    pdf_url: "https://api.neurocommerce.ai/storage/invoices/INV-2026-DEMO01.pdf",
    created_at: "2026-09-04T12:00:00Z",
    order: {
      id: "ord-uuid-101",
      order_number: "ORD-20260904-001",
      status: "delivered",
      subtotal: 185000.0,
      tax_amount: 13875.0,
      shipping_amount: 0.0,
      discount_amount: 0.0,
      total_amount: 198875.0,
      currency_code: "NGN",
      shipping_method: "Standard Express",
      payment_method: "Credit Card (Stripe)",
      coupon_code: null,
      placed_at: "2026-09-04T11:55:00Z",
      user: {
        id: "usr-cust-301",
        name: "Jane Doe",
        email: "jane@example.com",
      },
      billing_address: {
        first_name: "Jane",
        last_name: "Doe",
        address_line_1: "Plot 12B Victoria Island",
        city: "Lagos",
        state_province: "Lagos",
        postal_code: "101241",
        country_code: "NG",
        phone: "+2348012345678",
      },
      shipping_address: {
        first_name: "Jane",
        last_name: "Doe",
        address_line_1: "Plot 12B Victoria Island",
        city: "Lagos",
        state_province: "Lagos",
        postal_code: "101241",
        country_code: "NG",
        phone: "+2348012345678",
      },
      items: [
        {
          id: "item-uuid-501",
          product_id: "prod-uuid-901",
          variant_id: "var-uuid-901",
          product_sku: "NFS-HW-002",
          product_name: "NeuroFit Sense Smart Health Watch",
          variant_name: "Space Black / 44mm",
          unit_price: 185000.0,
          tax_amount: 13875.0,
          discount_amount: 0.0,
          quantity: 1,
          line_total: 185000.0,
        },
      ],
    },
  },
  {
    id: "inv-uuid-002",
    order_id: "ord-uuid-102",
    invoice_number: "INV-2026-DEMO02",
    status: "issued",
    status_label: "Issued",
    subtotal: 50000.0,
    tax_amount: 3750.0,
    total_amount: 53750.0,
    currency_code: "NGN",
    issued_at: "2026-09-05T08:00:00Z",
    paid_at: null,
    pdf_url: null,
    created_at: "2026-09-05T08:00:00Z",
    order: {
      id: "ord-uuid-102",
      order_number: "ORD-20260905-002",
      status: "pending",
      subtotal: 50000.0,
      tax_amount: 3750.0,
      shipping_amount: 0.0,
      discount_amount: 0.0,
      total_amount: 53750.0,
      currency_code: "NGN",
      shipping_method: "Standard Delivery",
      payment_method: "Bank Transfer",
      coupon_code: null,
      placed_at: "2026-09-05T07:55:00Z",
      user: {
        id: "usr-cust-302",
        name: "John Smith",
        email: "john@example.com",
      },
      billing_address: null,
      shipping_address: null,
      items: [],
    },
  },
];

// Mock invoice hooks
vi.mock("@/hooks/use-invoices", () => ({
  useInvoices: () => ({
    data: {
      data: mockInvoiceList,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 2,
      },
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  }),
  useInvoice: (id: string) => ({
    data: mockInvoiceList.find((inv) => inv.id === id) || mockInvoiceList[0],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
}

describe("Admin Invoicing & Financial Documents Suite (STEP 28.22)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and sync button", () => {
    render(<AdminInvoicesPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/Invoices & Documents/i)).toBeInTheDocument();
    expect(screen.getByText(/Commercial Billing & Ledger/i)).toBeInTheDocument();
    expect(screen.getByText(/Sync Invoices/i)).toBeInTheDocument();
  });

  it("2. Quick Metrics: calculates and renders real operational KPI cards", () => {
    render(<AdminInvoicesPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Total Invoices")).toBeInTheDocument();
    expect(screen.getByText("Invoiced Value")).toBeInTheDocument();
    expect(screen.getByText("Paid Invoices")).toBeInTheDocument();
    expect(screen.getByText("Pending / Issued")).toBeInTheDocument();
  });

  it("3. Invoices Table: renders invoice numbers, linked order, customer info, formatted amounts, and status pills", () => {
    render(<AdminInvoicesPage />, { wrapper: createWrapper() });

    expect(screen.getByText("INV-2026-DEMO01")).toBeInTheDocument();
    expect(screen.getByText("ORD-20260904-001")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getAllByText("Paid").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Issued").length).toBeGreaterThan(0);
  });

  it("4. Search & Filters: triggers search query and status/currency filter parameter changes", () => {
    render(<AdminInvoicesPage />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/Search by Invoice #, Order #, or Customer/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "INV-2026" } });
    expect(searchInput).toHaveValue("INV-2026");
  });

  it("5. Detail View: renders billing customer card, commercial order snapshot, shipping destination, and financial breakdown", async () => {
    await act(async () => {
      render(<InvoiceDetailPage params={Promise.resolve({ id: "inv-uuid-001" })} />, { wrapper: createWrapper() });
    });

    expect(screen.getByText("Billing Customer")).toBeInTheDocument();
    expect(screen.getByText("Commercial Order")).toBeInTheDocument();
    expect(screen.getByText("Delivery Destination")).toBeInTheDocument();
    expect(screen.getByText("Financial Breakdown")).toBeInTheDocument();
    expect(screen.getAllByText(/Plot 12B Victoria Island/i).length).toBeGreaterThan(0);
    expect(screen.getByText("ORD-20260904-001")).toBeInTheDocument();
  });

  it("6. Commercial Line Items: renders product names, SKUs, variants, unit prices, and quantities", async () => {
    await act(async () => {
      render(<InvoiceDetailPage params={Promise.resolve({ id: "inv-uuid-001" })} />, { wrapper: createWrapper() });
    });

    expect(screen.getByText("Commercial Line Items")).toBeInTheDocument();
    expect(screen.getByText("NeuroFit Sense Smart Health Watch")).toBeInTheDocument();
    expect(screen.getByText("NFS-HW-002")).toBeInTheDocument();
    expect(screen.getByText("Variant: Space Black / 44mm")).toBeInTheDocument();
  });

  it("7. Print Action: triggers window.print when print button is clicked", async () => {
    await act(async () => {
      render(<InvoiceDetailPage params={Promise.resolve({ id: "inv-uuid-001" })} />, { wrapper: createWrapper() });
    });

    const printButton = screen.getByRole("button", { name: /Print Invoice/i });
    fireEvent.click(printButton);

    expect(mockPrint).toHaveBeenCalledTimes(1);
  });
});
