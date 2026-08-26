import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CartPage from "@/app/(store)/cart/page";
import { CartDrawer } from "@/components/store/cart-drawer";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useApplyCoupon,
  useRemoveCoupon,
} from "@/hooks/use-cart";
import { useCartStore } from "@/stores/cart-store";
import { CartData } from "@/services/cart-service";

vi.mock("@/hooks/use-cart", () => ({
  useCart: vi.fn(),
  useUpdateCartItem: vi.fn(),
  useRemoveCartItem: vi.fn(),
  useClearCart: vi.fn(),
  useApplyCoupon: vi.fn(),
  useRemoveCoupon: vi.fn(),
}));

const mockCart: CartData = {
  id: "cart-1",
  items_count: 2,
  subtotal: 1099.98,
  discount_total: 0,
  tax_total: 0,
  shipping_total: 0,
  grand_total: 1099.98,
  items: [
    {
      id: "item-1",
      cart_id: "cart-1",
      product_id: "prod-1",
      quantity: 2,
      unit_price: 549.99,
      subtotal: 1099.98,
      product: {
        id: "prod-1",
        name: "Neural Interface V2 Pro",
        slug: "neural-interface-v2-pro",
        sku: "NIV2-PRO",
        base_price: 549.99,
        status: "active",
        is_active: true,
        is_featured: true,
        created_at: "2026-08-20T00:00:00Z",
        updated_at: "2026-08-20T00:00:00Z",
      },
      created_at: "2026-08-20T00:00:00Z",
      updated_at: "2026-08-20T00:00:00Z",
    },
  ],
};

describe("Cart Drawer & Full Shopping Bag Suite (STEP 26.3)", () => {
  const mockUpdate = vi.fn();
  const mockRemove = vi.fn();
  const mockClear = vi.fn();
  const mockApplyCoupon = vi.fn();
  const mockRemoveCoupon = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUpdateCartItem).mockReturnValue({
      mutate: mockUpdate,
      isPending: false,
    } as any);

    vi.mocked(useRemoveCartItem).mockReturnValue({
      mutate: mockRemove,
      isPending: false,
    } as any);

    vi.mocked(useClearCart).mockReturnValue({
      mutate: mockClear,
      isPending: false,
    } as any);

    vi.mocked(useApplyCoupon).mockReturnValue({
      mutate: mockApplyCoupon,
      isPending: false,
    } as any);

    vi.mocked(useRemoveCoupon).mockReturnValue({
      mutate: mockRemoveCoupon,
      isPending: false,
    } as any);
  });

  it("1. Shopping Bag Page: renders header, item card, line subtotal, and checkout CTA", () => {
    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    expect(screen.getByRole("heading", { level: 1, name: /shopping bag/i })).toBeInTheDocument();
    expect(screen.getByText("SHOPPING BAG")).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getAllByText("$1,099.98").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /proceed to checkout/i })).toBeInTheDocument();
  });

  it("2. Quantity Controls: triggers quantity increment and decrement mutations", () => {
    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    // Plus button
    const plusBtn = screen.getByRole("button", { name: /increase quantity/i });
    fireEvent.click(plusBtn);
    expect(mockUpdate).toHaveBeenCalledWith({ itemId: "item-1", quantity: 3 });

    // Minus button
    const minusBtn = screen.getByRole("button", { name: /decrease quantity/i });
    fireEvent.click(minusBtn);
    expect(mockUpdate).toHaveBeenCalledWith({ itemId: "item-1", quantity: 1 });
  });

  it("3. Item Removal: triggers remove item mutation via confirmation", () => {
    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    const removeBtn = screen.getByRole("button", { name: /remove neural interface v2 pro from shopping bag/i });
    fireEvent.click(removeBtn);

    const confirmBtn = screen.getByRole("button", { name: "Remove Item" });
    fireEvent.click(confirmBtn);

    expect(mockRemove).toHaveBeenCalledWith("item-1", expect.any(Object));
  });

  it("4. Coupon Application: applies promo code on submit", () => {
    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    const couponInput = screen.getByPlaceholderText(/enter promo code\.\.\./i);
    fireEvent.change(couponInput, { target: { value: "NEURO20" } });

    const applyBtn = screen.getByRole("button", { name: /apply/i });
    fireEvent.click(applyBtn);

    expect(mockApplyCoupon).toHaveBeenCalledWith("NEURO20", expect.any(Object));
  });

  it("5. Applied Coupon Removal: renders active coupon badge and allows removal", () => {
    vi.mocked(useCart).mockReturnValue({
      data: { ...mockCart, coupon_code: "NEURO20", discount_total: 50 },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    expect(screen.getByText("Active Coupon: NEURO20")).toBeInTheDocument();
    const removeCouponBtn = screen.getByRole("button", { name: "Remove" });
    fireEvent.click(removeCouponBtn);
    expect(mockRemoveCoupon).toHaveBeenCalledWith(undefined, expect.any(Object));
  });

  it("6. Cart Drawer: opens from Zustand store and renders mini bag experience", () => {
    useCartStore.setState({ isOpen: true, itemCount: 2 });

    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartDrawer />);

    expect(screen.getByText(/Shopping Bag \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /proceed to checkout/i })).toBeInTheDocument();
  });

  it("7. Empty States: renders structured empty state for both page and drawer", () => {
    vi.mocked(useCart).mockReturnValue({
      data: { ...mockCart, items: [], items_count: 0 },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    const { unmount } = render(<CartPage />);
    expect(screen.getByText(/your shopping bag is empty/i)).toBeInTheDocument();
    unmount();

    useCartStore.setState({ isOpen: true, itemCount: 0 });
    render(<CartDrawer />);
    expect(screen.getByText("Your shopping bag is empty")).toBeInTheDocument();
  });

  it("8. Error State: renders retry card on cart load failure", () => {
    vi.mocked(useCart).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    expect(screen.getByText("Unable to load your shopping bag")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
