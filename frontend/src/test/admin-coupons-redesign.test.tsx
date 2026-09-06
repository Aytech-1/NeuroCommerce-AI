import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AdminCouponsPage from "@/app/(admin)/admin/coupons/page";
import CreateCouponPage from "@/app/(admin)/admin/coupons/create/page";
import EditCouponPage from "@/app/(admin)/admin/coupons/[id]/edit/page";
import CouponDetailPage from "@/app/(admin)/admin/coupons/[id]/page";
import { useCoupons, useCoupon, useCouponUsage, useDeleteCoupon } from "@/hooks/use-coupons";
import { couponService, CouponItem } from "@/services/coupon-service";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/coupons",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/services/coupon-service", () => ({
  couponService: {
    createCoupon: vi.fn(),
    updateCoupon: vi.fn(),
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

describe("Admin Coupons, Promotions & Discount Management Suite (STEP 27.7)", () => {
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCoupons).mockReturnValue({
      data: {
        data: [mockCoupon],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useCoupon).mockReturnValue({
      data: mockCoupon,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useCouponUsage).mockReturnValue({
      data: {
        data: [
          {
            id: "usage-1",
            coupon_id: "coup-1",
            order_id: "ORD-2026-9901",
            discount_amount: 15,
            user: { first_name: "Sarah", last_name: "Connor" },
            created_at: "2026-08-20T10:00:00Z",
          },
        ],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
    } as any);

    vi.mocked(useDeleteCoupon).mockReturnValue({
      mutateAsync: mockDelete,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and Create Coupon CTA", () => {
    render(<AdminCouponsPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("PROMOTION MANAGEMENT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Coupons & Promotions", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create coupon/i })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative promotion KPI cards", () => {
    render(<AdminCouponsPage />);

    expect(screen.getByText("Total Coupons")).toBeInTheDocument();
    expect(screen.getByText("1 Coupons")).toBeInTheDocument();
    expect(screen.getByText("Active Campaigns")).toBeInTheDocument();
    expect(screen.getByText("1 Active")).toBeInTheDocument();
    expect(screen.getByText("Total Redemptions")).toBeInTheDocument();
    expect(screen.getByText("42 Uses")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search input and renders select options", () => {
    render(<AdminCouponsPage />);

    const searchInput = screen.getByPlaceholderText(/search by code or promo name/i);
    fireEvent.change(searchInput, { target: { value: "SUMMER" } });
    expect(searchInput).toHaveValue("SUMMER");

    expect(screen.getByText("All Discount Types")).toBeInTheDocument();
    expect(screen.getByText("All Statuses")).toBeInTheDocument();
  });

  it("4. Coupons Table: renders code, name, discount, usage, status, and actions", () => {
    render(<AdminCouponsPage />);

    expect(screen.getByText("SUMMER2026")).toBeInTheDocument();
    expect(screen.getByText("Summer Neuro Sale")).toBeInTheDocument();
    expect(screen.getByText("15% OFF")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("/ 500")).toBeInTheDocument();
  });

  it("5. Create Coupon Form: validates required fields and handles submit", async () => {
    vi.mocked(couponService.createCoupon).mockResolvedValueOnce({
      ...mockCoupon,
      id: "coup-new-123",
      code: "VIP50",
    });

    render(<CreateCouponPage />);

    expect(screen.getByText("PROMOTION OPERATIONS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create Promotional Coupon", level: 1 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /save coupon/i }));

    await waitFor(() => {
      expect(screen.getByText(/coupon code is required/i)).toBeInTheDocument();
      expect(screen.getByText(/campaign name is required/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/coupon code \*/i), { target: { value: "VIP50" } });
    fireEvent.change(screen.getByLabelText(/campaign name \*/i), { target: { value: "VIP Promotion" } });
    fireEvent.change(screen.getByLabelText(/discount value \*/i), { target: { value: "50" } });

    fireEvent.click(screen.getByRole("button", { name: /save coupon/i }));

    await waitFor(() => {
      expect(couponService.createCoupon).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/admin/coupons/coup-new-123");
    });
  });

  it("6. Coupon Detail View: renders discount rules, redemptions table, and quota schedule", async () => {
    await act(async () => {
      render(<CouponDetailPage params={Promise.resolve({ id: "coup-1" })} />);
    });

    expect(screen.getByText("COUPON INSPECTION")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "SUMMER2026", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("15% OFF")).toBeInTheDocument();
    expect(screen.getByText("₦100.00")).toBeInTheDocument();
    expect(screen.getByText("₦50.00")).toBeInTheDocument();
    expect(screen.getByText("Customer Redemptions (42)")).toBeInTheDocument();
    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-9901")).toBeInTheDocument();
    expect(screen.getByText("-₦15.00")).toBeInTheDocument();
  });

  it("7. Edit Coupon Form: renders preloaded values and handles update submission", async () => {
    vi.mocked(couponService.updateCoupon).mockResolvedValueOnce({
      ...mockCoupon,
    });

    await act(async () => {
      render(<EditCouponPage params={Promise.resolve({ id: "coup-1" })} />);
    });

    expect(screen.getByText("PROMOTION CONFIGURATION")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /edit coupon: summer2026/i, level: 1 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(couponService.updateCoupon).toHaveBeenCalled();
    });
  });

  it("8. Empty State: renders empty notice when 0 coupons exist", () => {
    vi.mocked(useCoupons).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 15, total: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminCouponsPage />);

    expect(screen.getByText("No Coupons Configured")).toBeInTheDocument();
  });
});
