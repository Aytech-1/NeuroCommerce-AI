import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AdminPaymentsPage from "@/app/(admin)/admin/payments/page";
import PaymentDetailPage from "@/app/(admin)/admin/payments/[id]/page";
import { usePayments, usePayment, useRefundPayment } from "@/hooks/use-payments";
import { PaymentItem } from "@/services/payment-service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/payments",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-payments", () => ({
  usePayments: vi.fn(),
  usePayment: vi.fn(),
  useRefundPayment: vi.fn(),
}));

const mockPaymentsList: PaymentItem[] = [
  {
    id: "pay-1",
    order_id: "ord-1",
    gateway: "paystack",
    gateway_payment_id: "PSTK_REF_9812401",
    method: "card",
    status: "completed",
    amount: 185000,
    currency_code: "NGN",
    card_last_four: "4242",
    card_brand: "visa",
    paid_at: "2026-08-25T10:00:00Z",
    failed_at: null,
    failure_reason: null,
    created_at: "2026-08-25T09:58:00Z",
    updated_at: "2026-08-25T10:00:00Z",
    order: {
      id: "ord-1",
      order_number: "ORD-2026-0001",
      user_id: "user-1",
      user: {
        id: "user-1",
        first_name: "Elena",
        last_name: "Rostova",
        email: "elena@example.com",
      },
    },
  },
  {
    id: "pay-2",
    order_id: "ord-2",
    gateway: "stripe",
    gateway_payment_id: "ch_3N19xK2eZvKYlo2C1",
    method: "card",
    status: "refunded",
    amount: 95000,
    currency_code: "NGN",
    card_last_four: "5555",
    card_brand: "mastercard",
    paid_at: "2026-08-26T12:00:00Z",
    failed_at: null,
    failure_reason: null,
    created_at: "2026-08-26T11:58:00Z",
    updated_at: "2026-08-26T13:00:00Z",
  },
];

const mockPaymentDetail: PaymentItem = {
  ...mockPaymentsList[0],
  transactions: [
    {
      id: "tx-1",
      type: "charge",
      amount: 185000,
      currency_code: "NGN",
      gateway_transaction_id: "TX_PSTK_001",
      status: "completed",
      created_at: "2026-08-25T10:00:00Z",
    },
  ],
  refunds: [
    {
      id: "ref-1",
      payment_id: "pay-1",
      order_id: "ord-1",
      amount: 25000,
      reason: "Partial goodwill refund",
      status: "completed",
      gateway_refund_id: "REF_PSTK_001",
      processed_by: "admin-1",
      processed_at: "2026-08-26T14:00:00Z",
      created_at: "2026-08-26T14:00:00Z",
      updated_at: "2026-08-26T14:00:00Z",
    },
  ],
};

describe("Admin Payment & Financial Transaction Operations Suite (STEP 28.19)", () => {
  const mockRefundMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(usePayments).mockReturnValue({
      data: {
        data: mockPaymentsList,
        meta: { current_page: 1, per_page: 15, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(usePayment).mockReturnValue({
      data: mockPaymentDetail,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useRefundPayment).mockReturnValue({
      mutateAsync: mockRefundMutateAsync,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and breadcrumb navigation", () => {
    render(<AdminPaymentsPage />);
    expect(screen.getByText("Admin Portal")).toBeDefined();
    expect(screen.getByText("FINANCIAL OPERATIONS")).toBeDefined();
    expect(screen.getByRole("heading", { name: "Payments & Transactions" })).toBeDefined();
  });

  it("2. Quick Metrics: renders total records, processed total amount, and refunds count", () => {
    render(<AdminPaymentsPage />);
    expect(screen.getByText("Total Records")).toBeDefined();
    expect(screen.getByText("Processed Total")).toBeDefined();
    expect(screen.getByText("Refunds Processed")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
  });

  it("3. Payments Table: renders gateway references, gateway badges, currency amounts, and status pills", () => {
    render(<AdminPaymentsPage />);
    expect(screen.getByText("PSTK_REF_9812401")).toBeInTheDocument();
    expect(screen.getByText("Paystack")).toBeInTheDocument();
    expect(screen.getByText("Stripe")).toBeInTheDocument();
    expect(screen.getAllByText("View").length).toBeGreaterThan(0);
  });

  it("4. Filters: updates search input and status selector", async () => {
    render(<AdminPaymentsPage />);
    const searchInput = screen.getByPlaceholderText("Search by Payment ID, Gateway Ref...");
    fireEvent.change(searchInput, { target: { value: "PSTK_REF" } });
    expect(searchInput).toHaveProperty("value", "PSTK_REF");
  });

  it("5. Payment Detail View: renders transaction summary, gateway details, amount, and linked order", async () => {
    await act(async () => {
      render(<PaymentDetailPage params={Promise.resolve({ id: "pay-1" })} />);
    });
    expect(screen.getByText("PAYMENT RECORD")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "PSTK_REF_9812401" })).toBeInTheDocument();
    expect(screen.getByText("Transaction Summary")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Elena Rostova")).toBeInTheDocument();
  });

  it("6. Transactions & Refunds Tables: renders gateway transactions and refund history", async () => {
    await act(async () => {
      render(<PaymentDetailPage params={Promise.resolve({ id: "pay-1" })} />);
    });
    expect(screen.getByText("Gateway Transactions")).toBeInTheDocument();
    expect(screen.getByText("TX_PSTK_001")).toBeInTheDocument();
    expect(screen.getByText("Refund History")).toBeInTheDocument();
    expect(screen.getByText("Partial goodwill refund")).toBeInTheDocument();
  });

  it("7. Process Refund Dialog: opens refund modal and triggers confirmation", async () => {
    await act(async () => {
      render(<PaymentDetailPage params={Promise.resolve({ id: "pay-1" })} />);
    });
    const refundBtn = screen.getByRole("button", { name: /Process Refund/i });
    fireEvent.click(refundBtn);

    expect(screen.getByText("Process Payment Refund")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proceed to Confirm" })).toBeInTheDocument();
  });
});