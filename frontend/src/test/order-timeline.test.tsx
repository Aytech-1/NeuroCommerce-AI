import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import OrderDetailPage from "@/app/(admin)/admin/orders/[id]/page";
import { useOrder, useOrderTimeline, useUpdateOrderStatus, useAddOrderNotes } from "@/hooks/use-orders";

vi.mock("@/hooks/use-orders", () => ({
  useOrder: vi.fn(),
  useOrderTimeline: vi.fn(),
  useUpdateOrderStatus: vi.fn(),
  useAddOrderNotes: vi.fn(),
}));

describe("Order Lifecycle Timeline and Admin Notes", () => {
  it("renders status transition entries with actor name and comment", async () => {
    vi.mocked(useOrder).mockReturnValue({
      data: {
        id: "ord-1",
        order_number: "ORD-2026-1001",
        status: "processing",
        status_label: "Processing",
        currency_code: "USD",
        subtotal: 100,
        tax_amount: 10,
        shipping_amount: 5,
        discount_amount: 0,
        total_amount: 115,
        item_count: 1,
        created_at: "2026-08-22T10:00:00Z",
        updated_at: "2026-08-22T10:05:00Z",
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useOrderTimeline).mockReturnValue({
      data: [
        {
          id: "tl-1",
          from_status: "pending",
          to_status: "processing",
          comment: "Payment captured successfully",
          changed_by: {
            id: "staff-1",
            first_name: "Admin",
            last_name: "User",
          },
          created_at: "2026-08-22T10:05:00Z",
        },
      ],
      isLoading: false,
    } as any);

    vi.mocked(useUpdateOrderStatus).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useAddOrderNotes).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    await act(async () => {
      render(<OrderDetailPage params={Promise.resolve({ id: "ord-1" })} />);
    });

    expect(await screen.findByText(/from pending/i)).toBeInTheDocument();
    expect(screen.getByText(/"Payment captured successfully"/i)).toBeInTheDocument();
    expect(screen.getByText(/By: Admin User/i)).toBeInTheDocument();
  });
});
