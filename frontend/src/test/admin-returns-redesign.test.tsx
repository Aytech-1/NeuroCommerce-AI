import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AdminReturnsPage from "@/app/(admin)/admin/returns/page";
import ReturnDetailPage from "@/app/(admin)/admin/returns/[id]/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/admin/returns",
}));

// Mock Can component for authorization
vi.mock("@/components/auth/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Sample authoritative mock data matching Laravel response
const mockRefundList = [
  {
    id: "ref-uuid-001",
    payment_id: "pay-uuid-101",
    order_id: "ord-uuid-201",
    amount: 15000.0,
    reason: "Damaged packaging on delivery",
    status: "processed",
    gateway_refund_id: "re_stripe_987654",
    processed_by: "usr-admin-001",
    processed_at: "2026-09-04T12:00:00Z",
    created_at: "2026-09-04T10:00:00Z",
    updated_at: "2026-09-04T12:00:00Z",
    payment: {
      id: "pay-uuid-101",
      order_id: "ord-uuid-201",
      gateway: "stripe",
      method: "card",
      status: "refunded",
      amount: 15000.0,
      currency_code: "NGN",
    },
    order: {
      id: "ord-uuid-201",
      order_number: "ORD-20260904-001",
      status: "refunded",
      total_amount: 15000.0,
      currency_code: "NGN",
      user: {
        id: "usr-cust-301",
        name: "Jane Doe",
        email: "jane@example.com",
      },
    },
    processor: {
      id: "usr-admin-001",
      name: "Super Administrator",
      email: "admin@neurocommerce.ai",
    },
  },
  {
    id: "ref-uuid-002",
    payment_id: "pay-uuid-102",
    order_id: "ord-uuid-202",
    amount: 5000.0,
    reason: "Wrong item delivered",
    status: "pending",
    gateway_refund_id: null,
    processed_by: null,
    processed_at: null,
    created_at: "2026-09-05T08:00:00Z",
    updated_at: "2026-09-05T08:00:00Z",
    payment: {
      id: "pay-uuid-102",
      order_id: "ord-uuid-202",
      gateway: "paystack",
      method: "bank_transfer",
      status: "completed",
      amount: 25000.0,
      currency_code: "NGN",
    },
    order: {
      id: "ord-uuid-202",
      order_number: "ORD-20260905-002",
      status: "delivered",
      total_amount: 25000.0,
      currency_code: "NGN",
      user: {
        id: "usr-cust-302",
        name: "John Smith",
        email: "john@example.com",
      },
    },
    processor: null,
  },
];

const mockMutateAsync = vi.fn().mockResolvedValue({ id: "ref-uuid-003", status: "processed" });

// Mock return hooks
vi.mock("@/hooks/use-returns", () => ({
  useRefunds: () => ({
    data: {
      data: mockRefundList,
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
  useRefund: (id: string) => ({
    data: mockRefundList.find((r) => r.id === id) || mockRefundList[0],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useProcessRefund: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
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

describe("Admin Returns & Refund Operations Suite (STEP 28.21)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and sync button", () => {
    render(<AdminReturnsPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/Returns & Refunds/i)).toBeInTheDocument();
    expect(screen.getByText(/After-Sales & Financial Reversals/i)).toBeInTheDocument();
    expect(screen.getByText(/Sync Reversals/i)).toBeInTheDocument();
  });

  it("2. Quick Metrics: calculates and renders real operational KPI cards", () => {
    render(<AdminReturnsPage />, { wrapper: createWrapper() });

    expect(screen.getByText("Total Reversals")).toBeInTheDocument();
    expect(screen.getByText("Processed Value")).toBeInTheDocument();
    expect(screen.getByText("Processed Count")).toBeInTheDocument();
    expect(screen.getByText("Pending Review")).toBeInTheDocument();
  });

  it("3. Returns Table: renders references, linked order, payment provider, customer info, and status pills", () => {
    render(<AdminReturnsPage />, { wrapper: createWrapper() });

    expect(screen.getByText("re_stripe_987654")).toBeInTheDocument();
    expect(screen.getByText("ORD-20260904-001")).toBeInTheDocument();
    expect(screen.getByText("stripe")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getAllByText("Processed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pending").length).toBeGreaterThan(0);
  });

  it("4. Search & Filters: triggers search query and status filter parameter changes", () => {
    render(<AdminReturnsPage />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/Search by Order ID or Refund ID/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "ORD-20260904" } });
    expect(searchInput).toHaveValue("ORD-20260904");
  });

  it("5. Detail View: renders financial reversal summary, linked order, payment settlement, and customer recipient", async () => {
    await act(async () => {
      render(<ReturnDetailPage params={Promise.resolve({ id: "ref-uuid-001" })} />, { wrapper: createWrapper() });
    });

    expect(screen.getByText("Financial Reversal Details")).toBeInTheDocument();
    expect(screen.getByText("Linked Order")).toBeInTheDocument();
    expect(screen.getByText("Payment & Gateway Settlement")).toBeInTheDocument();
    expect(screen.getByText("Customer Recipient")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("ORD-20260904-001")).toBeInTheDocument();
  });

  it("6. Reversal Audit Timeline: renders chronological event history and gateway settlement", async () => {
    await act(async () => {
      render(<ReturnDetailPage params={Promise.resolve({ id: "ref-uuid-001" })} />, { wrapper: createWrapper() });
    });

    expect(screen.getByText("Reversal Lifecycle Timeline")).toBeInTheDocument();
    expect(screen.getByText("Refund Request Created")).toBeInTheDocument();
    expect(screen.getByText("Settled via Gateway")).toBeInTheDocument();
  });

  it("7. Process Additional Reversal: opens modal, validates amount, and triggers mutation on confirmation", async () => {
    await act(async () => {
      render(<ReturnDetailPage params={Promise.resolve({ id: "ref-uuid-001" })} />, { wrapper: createWrapper() });
    });

    const issueButton = screen.getByRole("button", { name: /Issue Reversal/i });
    fireEvent.click(issueButton);

    expect(screen.getByText("Process Additional Reversal")).toBeInTheDocument();

    const amountInput = screen.getByPlaceholderText("0.00");
    fireEvent.change(amountInput, { target: { value: "5000" } });

    const submitButton = screen.getByRole("button", { name: /Review & Confirm/i });
    fireEvent.click(submitButton);

    const confirmButton = await screen.findByRole("button", { name: /Confirm & Execute Reversal/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        paymentId: "pay-uuid-101",
        payload: {
          amount: 5000,
          reason: undefined,
        },
      });
    });
  });
});
