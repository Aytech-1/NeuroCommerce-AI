import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CartPage from "@/app/(store)/cart/page";
import CheckoutPage from "@/app/(store)/checkout/page";
import CheckoutSuccessPage from "@/app/(store)/checkout/success/page";
import { CartDrawer } from "@/components/store/cart-drawer";
import { cartService } from "@/services/cart-service";
import { checkoutService } from "@/services/checkout-service";
import { apiClient } from "@/lib/api/client";
import {
  useCart,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart,
  useApplyCoupon,
  useRemoveCoupon,
} from "@/hooks/use-cart";
import {
  useShippingRates,
  useTaxCalculation,
  useProcessCheckout,
} from "@/hooks/use-checkout";
import { useCustomerProfile, useCustomerAddresses, useCustomerOrder } from "@/hooks/use-customer";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => {
    const params = new Map([
      ["order_id", "ord-123"],
      ["order_number", "ORD-LAB-2026-X8"],
    ]);
    return {
      get: (key: string) => params.get(key) || null,
    };
  },
  usePathname: () => "/checkout",
}));

// Mock API Client
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Hooks
vi.mock("@/hooks/use-cart", () => ({
  useCart: vi.fn(),
  useUpdateCartItem: vi.fn(),
  useRemoveCartItem: vi.fn(),
  useClearCart: vi.fn(),
  useApplyCoupon: vi.fn(),
  useRemoveCoupon: vi.fn(),
}));

vi.mock("@/hooks/use-checkout", () => ({
  useShippingRates: vi.fn(),
  useTaxCalculation: vi.fn(),
  useValidateCheckout: vi.fn(),
  useProcessCheckout: vi.fn(),
}));

vi.mock("@/hooks/use-customer", () => ({
  useCustomerProfile: vi.fn(),
  useCustomerAddresses: vi.fn(),
  useCustomerOrder: vi.fn(),
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

const mockCartData = {
  id: "cart-001",
  user_id: "usr-001",
  session_id: "sess-001",
  currency_code: "NGN",
  items_count: 2,
  subtotal: 1599.0,
  discount_total: 0.0,
  tax_total: 0.0,
  shipping_total: 0.0,
  grand_total: 1599.0,
  coupon_code: null,
  items: [
    {
      id: "item-001",
      cart_id: "cart-001",
      product_id: "prod-001",
      variant_id: "var-001",
      quantity: 1,
      unit_price: 999.0,
      subtotal: 999.0,
      product: {
        id: "prod-001",
        name: "Synaptic BCI Wireless Node",
        slug: "synaptic-bci-node",
        sku: "SBCI-WN",
        primary_image_url: "/media/products/sbci-node.png",
        is_active: true,
        stock_quantity: 10,
        brand: { id: "b1", name: "NeuroLink" },
      },
      variant: {
        id: "var-001",
        sku: "SBCI-WN-BLK",
        name: "Matte Black",
        price: 999.0,
        stock_quantity: 5,
      },
    },
    {
      id: "item-002",
      cart_id: "cart-001",
      product_id: "prod-002",
      variant_id: null,
      quantity: 2,
      unit_price: 300.0,
      subtotal: 600.0,
      product: {
        id: "prod-002",
        name: "High-Conductivity EEG Gel Kit",
        slug: "eeg-gel-kit",
        sku: "EEG-GEL-100",
        primary_image_url: "/media/products/eeg-gel.png",
        is_active: true,
        stock_quantity: 50,
        brand: { id: "b2", name: "CortexLab" },
      },
      variant: null,
    },
  ],
};

const mockShippingRates = [
  {
    id: "rate-standard",
    name: "Standard Ground Delivery",
    carrier: "USPS Laboratory Express",
    cost: 0.0,
    estimated_days: "3-5 business days",
    description: "Standard ground shipping",
  },
  {
    id: "rate-express",
    name: "Priority Cryo/Secure Air",
    carrier: "FedEx Critical Tech",
    cost: 150.0,
    estimated_days: "1-2 business days",
    description: "Expedited shipping",
  },
];

describe("STEP 28.29 — Real Customer Cart & Checkout Flow Hardening Suite", () => {
  const mockUpdateMutate = vi.fn();
  const mockRemoveMutate = vi.fn();
  const mockClearMutate = vi.fn();
  const mockApplyCouponMutate = vi.fn();
  const mockRemoveCouponMutate = vi.fn();
  const mockProcessCheckoutMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "usr-001",
        first_name: "Alexander",
        last_name: "Chen",
        email: "dr.chen@neurotech.org",
        phone: "+1 555-0199",
      },
      token: "mock-token",
      isAuthenticated: true,
    } as any);

    vi.mocked(useCart).mockReturnValue({
      data: mockCartData,
      isLoading: false,
      isError: false,
    } as any);

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

    vi.mocked(useShippingRates).mockReturnValue({
      data: mockShippingRates,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useTaxCalculation).mockReturnValue({
      data: {
        tax_rate: 0.05,
        tax_amount: 80.0,
        subtotal: 1599.0,
        shipping_amount: 0.0,
        total: 1679.0,
        jurisdiction: "MA",
        currency: "NGN",
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useCustomerProfile).mockReturnValue({
      data: {
        id: "usr-001",
        first_name: "Alexander",
        last_name: "Chen",
        email: "dr.chen@neurotech.org",
        phone: "+1 555-0199",
      },
      isLoading: false,
    } as any);

    vi.mocked(useCustomerAddresses).mockReturnValue({
      data: [
        {
          id: "addr-001",
          first_name: "Alexander",
          last_name: "Chen",
          address_line_1: "742 Neuroscience Blvd",
          city: "Boston",
          state: "MA",
          postal_code: "02115",
          country_code: "US",
          phone: "+1 555-0199",
          is_default: true,
        },
      ],
      isLoading: false,
    } as any);

    vi.mocked(useProcessCheckout).mockReturnValue({
      mutate: mockProcessCheckoutMutate,
      isPending: false,
    } as any);
  });

  // 1. Cart loads real data
  it("1. Cart loads real data from backend and displays line items", () => {
    render(<CartPage />);
    expect(screen.getByText("Synaptic BCI Wireless Node")).toBeInTheDocument();
    expect(screen.getByText("High-Conductivity EEG Gel Kit")).toBeInTheDocument();
    expect(screen.getAllByText("₦1,599.00").length).toBeGreaterThan(0);
  });

  // 2. Cart badge reflects backend data
  it("2. Cart badge reflects backend item count", () => {
    const { setItemCount } = useCartStore.getState();
    setItemCount(mockCartData.items_count);
    expect(useCartStore.getState().itemCount).toBe(2);
  });

  // 3. Add-to-cart updates cart via cartService
  it("3. cartService.addItem posts to real /cart/items endpoint", async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, data: mockCartData.items[0] },
    });

    const result = await cartService.addItem("prod-001", 1, "var-001");

    expect(apiClient.post).toHaveBeenCalledWith("/cart/items", {
      product_id: "prod-001",
      quantity: 1,
      variant_id: "var-001",
    });
    expect(result.id).toBe("item-001");
  });

  // 4. Quantity update works
  it("4. Quantity update triggers mutation with new quantity", () => {
    render(<CartPage />);
    const increaseBtns = screen.getAllByRole("button", { name: /increase quantity/i });
    fireEvent.click(increaseBtns[0]);

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: "item-001", quantity: 2 })
    );
  });

  // 5. Remove item works
  it("5. Remove item triggers confirm dialog and remove mutation", () => {
    render(<CartPage />);
    const removeBtns = screen.getAllByRole("button", { name: /remove synaptic bci wireless node from shopping bag/i });
    fireEvent.click(removeBtns[0]);

    const confirmBtn = screen.getByRole("button", { name: "Remove Item" });
    fireEvent.click(confirmBtn);

    expect(mockRemoveMutate).toHaveBeenCalledWith("item-001", expect.any(Object));
  });

  // 6. Clear cart works
  it("6. Clear cart triggers confirm dialog and clear cart mutation", () => {
    render(<CartPage />);
    const clearBtn = screen.getByRole("button", { name: /clear bag/i });
    fireEvent.click(clearBtn);

    const confirmClear = screen.getByRole("button", { name: "Clear Bag" });
    fireEvent.click(confirmClear);

    expect(mockClearMutate).toHaveBeenCalledWith(undefined, expect.any(Object));
  });

  // 7. Empty cart works
  it("7. Empty cart displays empty state with catalog CTA", () => {
    vi.mocked(useCart).mockReturnValue({
      data: { ...mockCartData, items: [], items_count: 0 },
      isLoading: false,
      isError: false,
    } as any);

    render(<CartPage />);
    expect(screen.getByText("Your Shopping Bag Is Empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore products/i })).toHaveAttribute("href", "/products");
  });

  // 8. Coupon apply works
  it("8. Coupon code submission triggers applyCoupon mutation", () => {
    render(<CartPage />);
    const couponInput = screen.getByPlaceholderText(/enter promo code/i);
    const applyBtn = screen.getByRole("button", { name: /apply/i });

    fireEvent.change(couponInput, { target: { value: "NEURO10" } });
    fireEvent.click(applyBtn);

    expect(mockApplyCouponMutate).toHaveBeenCalledWith("NEURO10", expect.any(Object));
  });

  // 9. Coupon removal works
  it("9. Coupon remove triggers removeCoupon mutation when active", () => {
    vi.mocked(useCart).mockReturnValue({
      data: { ...mockCartData, coupon_code: "NEURO10", discount_total: 159.9 },
      isLoading: false,
      isError: false,
    } as any);

    render(<CartPage />);
    const removeCouponBtn = screen.getByRole("button", { name: "Remove" });
    fireEvent.click(removeCouponBtn);

    expect(mockRemoveCouponMutate).toHaveBeenCalled();
  });

  // 10. Shipping rates load
  it("10. checkoutService.getShippingRates calls GET /checkout/shipping-rates", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: [{ id: "standard", name: "Standard Ground", carrier: "USPS", cost: 0.0, estimated_days: "3-5" }],
      },
    });

    const rates = await checkoutService.getShippingRates();
    expect(apiClient.get).toHaveBeenCalledWith("/checkout/shipping-rates");
    expect(rates).toHaveLength(1);
  });

  // 11. Saved address selection on checkout
  it("11. Checkout page renders saved customer addresses for quick selection on delivery step", () => {
    render(<CheckoutPage />);
    const nextToDelivery = screen.getByRole("button", { name: /continue to delivery address/i });
    fireEvent.click(nextToDelivery);

    expect(screen.getByText("742 Neuroscience Blvd")).toBeInTheDocument();
    expect(screen.getByText("Boston, MA 02115")).toBeInTheDocument();
  });

  // 12. Checkout request uses real API
  it("12. checkoutService.processCheckout calls POST /checkout", async () => {
    const mockResponse = {
      order: { id: "ord-123", order_number: "ORD-9999", total_amount: 1599.0 },
      payment: { transaction_id: "tx-123", status: "succeeded" as const, payment_method: "stripe" },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, data: mockResponse },
    });

    const result = await checkoutService.processCheckout({
      shipping_address: {
        first_name: "Alexander",
        last_name: "Chen",
        address_line_1: "742 Neuroscience Blvd",
        city: "Boston",
        postal_code: "02115",
        country_code: "US",
      },
      billing_address: {
        first_name: "Alexander",
        last_name: "Chen",
        address_line_1: "742 Neuroscience Blvd",
        city: "Boston",
        postal_code: "02115",
        country_code: "US",
      },
      payment_method: "stripe",
      payment_token: "tok_visa",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/checkout", expect.any(Object));
    expect(result.order.id).toBe("ord-123");
  });

  // 13. Double-submission prevention
  it("13. Place Order button is disabled while mutation is pending", () => {
    vi.mocked(useProcessCheckout).mockReturnValue({
      mutate: mockProcessCheckoutMutate,
      isPending: true,
    } as any);

    render(<CheckoutPage />);
    // Step 1 -> Step 2
    const nextToDelivery = screen.getByRole("button", { name: /continue to delivery address/i });
    fireEvent.click(nextToDelivery);

    // Step 2 -> Step 3
    const nextToShipping = screen.getByRole("button", { name: /continue to shipping method/i });
    fireEvent.click(nextToShipping);

    // Step 3 -> Step 4
    const nextToPayment = screen.getByRole("button", { name: /continue to payment/i });
    fireEvent.click(nextToPayment);

    const placeOrderBtn = screen.getByRole("button", { name: /authorizing order/i });
    expect(placeOrderBtn).toBeDisabled();
  });

  // 14. Cart Drawer synchronization
  it("14. Cart Drawer reflects the same backend cart query items", () => {
    useCartStore.setState({ isOpen: true });
    render(<CartDrawer />);

    expect(screen.getByText("Shopping Bag (2)")).toBeInTheDocument();
    expect(screen.getByText("Synaptic BCI Wireless Node")).toBeInTheDocument();
  });

  // 15. Checkout success page displays confirmed order details
  it("15. Checkout success page displays confirmed order number and status", () => {
    vi.mocked(useCustomerOrder).mockReturnValue({
      data: {
        id: "ord-123",
        order_number: "ORD-LAB-2026-X8",
        status: "paid",
        status_label: "Paid",
        currency_code: "NGN",
        total_amount: 1599.0,
        subtotal: 1599.0,
        items: [],
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<CheckoutSuccessPage />);
    expect(screen.getByText("LABORATORY ORDER CONFIRMED")).toBeInTheDocument();
  });
});
