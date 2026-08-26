import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AdminCouponsPage from "@/app/(admin)/admin/coupons/page";
import CreateCouponPage from "@/app/(admin)/admin/coupons/create/page";
import CouponDetailPage from "@/app/(admin)/admin/coupons/[id]/page";
import { useCoupons, useCoupon, useCouponUsage, useDeleteCoupon } from "@/hooks/use-coupons";
import { couponService, CouponItem } from "@/services/coupon-service";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/services/coupon-service", () => ({
  couponService: {
    createCoupon: vi.fn(),
  },
}));

vi.mock("@/hooks/use-coupons", () => ({
  useCoupons: vi.fn(),
  useCoupon: vi.fn(),
  useCouponUsage: vi.fn(),
  useDeleteCoupon: vi.fn(),
}));

const mockCoupon: CouponItem = {
  id: "coup-1",
  code: "SUMMER2026",
  name: "Summer Neuro Sale",
  description: "15% off all neural headsets",
  type: "percentage",
  value: 15,
  min_order_amount: 100,
  max_discount_amount: 50,
  usage_limit: 500,
  usage_limit_per_user: 1,
  times_used: 42,
  starts_at: "2026-08-01T00:00:00Z",
  expires_at: "2026-08-31T00:00:00Z",
  is_active: true,
  is_valid: true,
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
};

describe("Admin Coupons Management Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDeleteCoupon).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useCouponUsage).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 15, total: 0, last_page: 1 } },
      isLoading: false,
    } as any);
  });

  it("renders coupon list table with discount value and usage stats", () => {
    vi.mocked(useCoupons).mockReturnValue({
      data: {
        data: [mockCoupon],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminCouponsPage />);

    expect(screen.getByText("SUMMER2026")).toBeInTheDocument();
    expect(screen.getByText("Summer Neuro Sale")).toBeInTheDocument();
    expect(screen.getByText("15% OFF")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("validates required fields on coupon creation submit", async () => {
    render(<CreateCouponPage />);

    fireEvent.click(screen.getByRole("button", { name: /save coupon/i }));

    await waitFor(() => {
      expect(screen.getByText(/coupon code is required/i)).toBeInTheDocument();
      expect(screen.getByText(/campaign name is required/i)).toBeInTheDocument();
    });
  });

  it("submits valid coupon payload and redirects to detail", async () => {
    vi.mocked(couponService.createCoupon).mockResolvedValueOnce({
      ...mockCoupon,
      id: "coup-new-99",
      code: "LAUNCH50",
    });

    render(<CreateCouponPage />);

    fireEvent.change(screen.getByLabelText(/coupon code \*/i), { target: { value: "LAUNCH50" } });
    fireEvent.change(screen.getByLabelText(/campaign name \*/i), { target: { value: "Launch Promotion" } });
    fireEvent.change(screen.getByLabelText(/discount value \*/i), { target: { value: "50" } });

    fireEvent.click(screen.getByRole("button", { name: /save coupon/i }));

    await waitFor(() => {
      expect(couponService.createCoupon).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/admin/coupons/coup-new-99");
    });
  });

  it("renders coupon detail inspection view", async () => {
    vi.mocked(useCoupon).mockReturnValue({
      data: mockCoupon,
      isLoading: false,
      isError: false,
    } as any);

    await act(async () => {
      render(<CouponDetailPage params={Promise.resolve({ id: "coup-1" })} />);
    });

    expect(screen.getByRole("heading", { name: "SUMMER2026" })).toBeInTheDocument();
    expect(screen.getByText("15% OFF")).toBeInTheDocument();
    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });
});
