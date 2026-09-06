import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CartPage from "@/app/(store)/cart/page";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useApplyCoupon,
  useRemoveCoupon,
} from "@/hooks/use-cart";
import { CartData } from "@/services/cart-service";
import { notify } from "@/lib/notifications";

vi.mock("@/hooks/use-cart", () => ({
  useCart: vi.fn(),
  useUpdateCartItem: vi.fn(),
  useRemoveCartItem: vi.fn(),
  useClearCart: vi.fn(),
  useApplyCoupon: vi.fn(),
  useRemoveCoupon: vi.fn(),
}));

vi.mock("@/lib/notifications", () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    promise: vi.fn(),
    dismiss: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockCart: CartData = {
  id: "cart-101",
  items_count: 3,
  subtotal: 3298.0,
  discount_total: 0,
  tax_total: 0,
  shipping_total: 0,
  grand_total: 3298.0,
  items: [
    {
      id: "item-1",
      cart_id: "cart-101",
      product_id: "prod-1",
      quantity: 2,
      unit_price: 1399.0,
      subtotal: 2798.0,
      product: {
        id: "prod-1",
        name: "CortexLink Pro BCI Headband",
        slug: "cortexlink-pro-bci",
        sku: "CLP-01",
        base_price: 1399.0,
        sale_price: null,
        stock_quantity: 12,
        status: "active",
        is_active: true,
        is_featured: true,
        brand: { id: "br-1", name: "CortexDynamics" },
        created_at: "2026-08-01T00:00:00Z",
        updated_at: "2026-08-01T00:00:00Z",
      },
      created_at: "2026-08-01T00:00:00Z",
      updated_at: "2026-08-01T00:00:00Z",
    },
    {
      id: "item-2",
      cart_id: "cart-101",
      product_id: "prod-2",
      quantity: 1,
      unit_price: 500.0,
      subtotal: 500.0,
      product: {
        id: "prod-2",
        name: "Synaptic Telemetry Bio-Amplifier",
        slug: "synaptic-telemetry-bio-amplifier",
        sku: "STB-04",
        base_price: 500.0,
        sale_price: null,
        stock_quantity: 2,
        status: "active",
        is_active: true,
        is_featured: false,
        brand: { id: "br-2", name: "Synaptic Systems" },
        created_at: "2026-08-02T00:00:00Z",
        updated_at: "2026-08-02T00:00:00Z",
      },
      created_at: "2026-08-02T00:00:00Z",
      updated_at: "2026-08-02T00:00:00Z",
    },
  ],
};

describe("STEP 28.3 — Storefront Shopping Bag & Cart Experience Suite", () => {
  const mockUpdateMutate = vi.fn();
  const mockRemoveMutate = vi.fn();
  const mockClearMutate = vi.fn();
  const mockApplyCouponMutate = vi.fn();
  const mockRemoveCouponMutate = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUpdateCartItem).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as any);

    vi.mocked(useRemoveCartItem).mockReturnValue({
      mutate: mockRemoveMutate,
      isPending: false,
    } as any);

    vi.mocked(useClearCart).mockReturnValue({
      mutate: mockClearMutate,
      isPending: false,
    } as any);

    vi.mocked(useApplyCoupon).mockReturnValue({
      mutate: mockApplyCouponMutate,
      isPending: false,
    } as any);

    vi.mocked(useRemoveCoupon).mockReturnValue({
      mutate: mockRemoveCouponMutate,
      isPending: false,
    } as any);
  });

  it("1. Cart Page Rendering: renders executive hero, single H1, and breadcrumb", () => {
    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    // Breadcrumb landmark
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");

    // Single H1
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Your Shopping Bag");

    expect(screen.getByText("SHOPPING BAG")).toBeInTheDocument();
    expect(screen.getByText(/3 items in your bag/i)).toBeInTheDocument();
  });

  it("2. Cart Item List: renders authoritative product names, brands, unit prices, and stock indicators", () => {
    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    expect(screen.getByText("CortexDynamics")).toBeInTheDocument();
    expect(screen.getByText("CortexLink Pro BCI Headband")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();

    expect(screen.getByText("Synaptic Systems")).toBeInTheDocument();
    expect(screen.getByText("Synaptic Telemetry Bio-Amplifier")).toBeInTheDocument();
    expect(screen.getByText("Low Stock (2 left)")).toBeInTheDocument();

    expect(screen.getByText("₦2,798.00")).toBeInTheDocument();
    const prices500 = screen.getAllByText("₦500.00");
    expect(prices500.length).toBeGreaterThanOrEqual(1);
  });

  it("3. Quantity Controls: triggers quantity increment and decrement mutations with accessible labels", () => {
    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    // Increment item 1
    const incBtn = screen.getByRole("button", {
      name: "Increase quantity for CortexLink Pro BCI Headband",
    });
    fireEvent.click(incBtn);
    expect(mockUpdateMutate).toHaveBeenCalledWith({ itemId: "item-1", quantity: 3 });

    // Decrement item 1
    const decBtn = screen.getByRole("button", {
      name: "Decrease quantity for CortexLink Pro BCI Headband",
    });
    fireEvent.click(decBtn);
    expect(mockUpdateMutate).toHaveBeenCalledWith({ itemId: "item-1", quantity: 1 });

    // Item 2 has quantity 1 -> minus button should be disabled
    const decBtn2 = screen.getByRole("button", {
      name: "Decrease quantity for Synaptic Telemetry Bio-Amplifier",
    });
    expect(decBtn2).toBeDisabled();
  });

  it("4. Remove Item Dialog & Mutation: opens ConfirmDialog and executes removal", async () => {
    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    const removeBtn = screen.getByRole("button", {
      name: "Remove CortexLink Pro BCI Headband from shopping bag",
    });
    fireEvent.click(removeBtn);

    // Dialog should appear
    expect(screen.getByText("Remove Item?")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to remove CortexLink Pro BCI Headband from your shopping bag\?/i)
    ).toBeInTheDocument();

    // Confirm button in dialog
    const confirmBtn = screen.getByRole("button", { name: "Remove Item" });
    fireEvent.click(confirmBtn);

    expect(mockRemoveMutate).toHaveBeenCalledWith("item-1", expect.any(Object));

    // Simulate success callback
    const mutateCall = mockRemoveMutate.mock.calls[0][1];
    mutateCall.onSuccess();
    expect(notify.success).toHaveBeenCalledWith("Item removed from your shopping bag");
  });

  it("5. Clear Bag Dialog & Mutation: opens ConfirmDialog and executes clear cart", () => {
    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    const clearBagBtn = screen.getByRole("button", { name: /clear bag/i });
    fireEvent.click(clearBagBtn);

    // Dialog should appear
    expect(screen.getByText("Clear Shopping Bag?")).toBeInTheDocument();
    expect(
      screen.getByText("This will remove all items from your shopping bag.")
    ).toBeInTheDocument();

    const confirmClearBtn = screen.getByRole("button", { name: "Clear Bag" });
    fireEvent.click(confirmClearBtn);

    expect(mockClearMutate).toHaveBeenCalled();

    // Simulate success callback
    const mutateCall = mockClearMutate.mock.calls[0][1];
    mutateCall.onSuccess();
    expect(notify.success).toHaveBeenCalledWith("Shopping bag cleared");
  });

  it("6. Order Summary & Checkout CTA: renders authoritative totals and navigation link", () => {
    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    expect(screen.getByText("Order Summary")).toBeInTheDocument();
    expect(screen.getByText("Hardware Subtotal")).toBeInTheDocument();
    const totals = screen.getAllByText("₦3,298.00");
    expect(totals.length).toBeGreaterThanOrEqual(1);

    const checkoutLink = screen.getByRole("link", { name: /proceed to checkout/i });
    expect(checkoutLink).toHaveAttribute("href", "/checkout");

    const continueShoppingLink = screen.getByRole("link", { name: /continue shopping/i });
    expect(continueShoppingLink).toHaveAttribute("href", "/products");
  });

  it("7. Promo Code Section: applies promo code with notify feedback", () => {
    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    const couponInput = screen.getByPlaceholderText(/enter promo code\.\.\./i);
    fireEvent.change(couponInput, { target: { value: "NEURO25" } });

    const applyBtn = screen.getByRole("button", { name: "Apply" });
    fireEvent.click(applyBtn);

    expect(mockApplyCouponMutate).toHaveBeenCalledWith("NEURO25", expect.any(Object));

    // Simulate success callback
    const mutateCall = mockApplyCouponMutate.mock.calls[0][1];
    mutateCall.onSuccess();
    expect(notify.success).toHaveBeenCalledWith("Promo code applied");
  });

  it("8. Applied Promo Code: displays active coupon pill and triggers remove mutation", () => {
    vi.mocked(useCart).mockReturnValue({
      data: {
        ...mockCart,
        coupon_code: "NEURO25",
        discount_total: 250,
        grand_total: 3048,
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    expect(screen.getByText("Active Coupon: NEURO25")).toBeInTheDocument();
    expect(screen.getByText("Promotional Discount")).toBeInTheDocument();
    expect(screen.getByText("-₦250.00")).toBeInTheDocument();

    const removeCouponBtn = screen.getByRole("button", { name: "Remove" });
    fireEvent.click(removeCouponBtn);

    expect(mockRemoveCouponMutate).toHaveBeenCalledWith(undefined, expect.any(Object));
  });

  it("9. Empty Cart State: renders structured empty state with Explore Products CTA", () => {
    vi.mocked(useCart).mockReturnValue({
      data: { ...mockCart, items: [], items_count: 0 },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CartPage />);

    expect(screen.getByText("Your Shopping Bag Is Empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore products/i })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: /explore categories/i })).toHaveAttribute("href", "/categories");
  });

  it("10. Loading State: renders geometry-matched skeletons", () => {
    vi.mocked(useCart).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    } as any);

    const { container } = render(<CartPage />);

    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });

  it("11. Error State: renders non-technical error card with retry button", () => {
    vi.mocked(useCart).mockReturnValue({
      data: undefined,
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
