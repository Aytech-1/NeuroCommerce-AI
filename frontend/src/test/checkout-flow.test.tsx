import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CheckoutPage from "@/app/(store)/checkout/page";
import CheckoutSuccessPage from "@/app/(store)/checkout/success/page";
import { useCart } from "@/hooks/use-cart";
import { useCustomerProfile, useCustomerAddresses, useCustomerOrder } from "@/hooks/use-customer";
import { useShippingRates, useTaxCalculation, useProcessCheckout } from "@/hooks/use-checkout";
import { useAuthStore } from "@/stores/auth-store";
import { CartData } from "@/services/cart-service";
import { useSearchParams } from "next/navigation";

vi.mock("@/hooks/use-cart", () => ({
  useCart: vi.fn(),
}));

vi.mock("@/hooks/use-customer", () => ({
  useCustomerProfile: vi.fn(),
  useCustomerAddresses: vi.fn(),
  useCustomerOrder: vi.fn(),
}));

vi.mock("@/hooks/use-checkout", () => ({
  useShippingRates: vi.fn(),
  useTaxCalculation: vi.fn(),
  useProcessCheckout: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: vi.fn(),
}));

const mockCartData: CartData = {
  id: "cart-1",
  items_count: 1,
  subtotal: 549.99,
  discount_total: 0,
  tax_total: 0,
  shipping_total: 0,
  grand_total: 549.99,
  items: [
    {
      id: "ci-1",
      cart_id: "cart-1",
      product_id: "prod-1",
      quantity: 1,
      unit_price: 549.99,
      subtotal: 549.99,
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

const mockShippingRates = [
  {
    id: "standard",
    name: "Standard Ground Delivery",
    carrier: "USPS",
    cost: 0.0,
    estimated_days: "3-5 business days",
  },
  {
    id: "express",
    name: "Express Air Delivery",
    carrier: "FedEx",
    cost: 15.0,
    estimated_days: "1-2 business days",
  },
];

describe("Checkout & Order Confirmation Flow Suite (STEP 26.5)", () => {
  const mockProcessCheckout = vi.fn();
  const mockRefetchOrder = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    vi.mocked(useCart).mockReturnValue({
      data: mockCartData,
      isLoading: false,
    } as any);

    vi.mocked(useCustomerProfile).mockReturnValue({
      data: null,
      isLoading: false,
    } as any);

    vi.mocked(useCustomerAddresses).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    vi.mocked(useShippingRates).mockReturnValue({
      data: mockShippingRates,
      isLoading: false,
    } as any);

    vi.mocked(useTaxCalculation).mockReturnValue({
      data: { tax_rate: 0, tax_amount: 0, jurisdiction: "US" },
      isLoading: false,
    } as any);

    vi.mocked(useProcessCheckout).mockReturnValue({
      mutate: mockProcessCheckout,
      isPending: false,
    } as any);

    vi.mocked(useSearchParams).mockReturnValue({
      get: (key: string) => (key === "order_number" ? "ORD-2026-0001" : "ord-1"),
    } as any);
  });

  it("1. Checkout Load: renders step progress pills, contact info, and sticky order review", () => {
    render(<CheckoutPage />);

    expect(screen.getByText("Checkout & Hardware Acquisition")).toBeInTheDocument();
    expect(screen.getByText("1. Researcher Contact Information")).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getAllByText("₦549.99").length).toBeGreaterThanOrEqual(1);
  });

  it("2. Step Transitions & Order Submission: completes 4-step flow and submits payload", async () => {
    render(<CheckoutPage />);

    // Step 1: Fill contact info
    const firstNameInput = screen.getByPlaceholderText("Sarah");
    const lastNameInput = screen.getByPlaceholderText("Connor");
    const emailInput = screen.getByPlaceholderText("sarah.connor@cyberdyne.lab");

    fireEvent.change(firstNameInput, { target: { value: "Sarah" } });
    fireEvent.change(lastNameInput, { target: { value: "Connor" } });
    fireEvent.change(emailInput, { target: { value: "sarah@cyberdyne.lab" } });

    const continueToAddressBtn = screen.getByRole("button", { name: /continue to delivery address/i });
    fireEvent.click(continueToAddressBtn);

    // Step 2: Delivery Address
    expect(screen.getByText("2. Laboratory Shipping Destination")).toBeInTheDocument();
    const addressInput = screen.getByPlaceholderText("77 Massachusetts Avenue, Building E25");
    const cityInput = screen.getByPlaceholderText("Cambridge");
    const zipInput = screen.getByPlaceholderText("02139");

    fireEvent.change(addressInput, { target: { value: "77 Massachusetts Ave" } });
    fireEvent.change(cityInput, { target: { value: "Cambridge" } });
    fireEvent.change(zipInput, { target: { value: "02139" } });

    const continueToShippingBtn = screen.getByRole("button", { name: /continue to shipping method/i });
    fireEvent.click(continueToShippingBtn);

    // Step 3: Shipping Method
    expect(screen.getByText("3. Select Logistics & Courier Method")).toBeInTheDocument();
    const continueToPaymentBtn = screen.getByRole("button", { name: /continue to payment/i });
    fireEvent.click(continueToPaymentBtn);

    // Step 4: Payment Method & Place Order
    expect(screen.getByText("4. Secure Payment Method")).toBeInTheDocument();
    const placeOrderBtn = screen.getByRole("button", { name: /authorize & place order/i });
    fireEvent.click(placeOrderBtn);

    expect(mockProcessCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_method: "stripe",
        shipping_method: "Standard Ground Delivery",
        guest_email: "sarah@cyberdyne.lab",
        guest_first_name: "Sarah",
        guest_last_name: "Connor",
      })
    );
  });

  it("3. Authenticated Address Pre-selection: preloads saved lab addresses", () => {
    useAuthStore.setState({
      user: { id: "u-1", email: "dr.chen@mit.edu", first_name: "Dr. Alex", last_name: "Chen", role: "customer" } as any,
      isAuthenticated: true,
    });

    vi.mocked(useCustomerProfile).mockReturnValue({
      data: { id: "u-1", email: "dr.chen@mit.edu", first_name: "Dr. Alex", last_name: "Chen" },
      isLoading: false,
    } as any);

    vi.mocked(useCustomerAddresses).mockReturnValue({
      data: [
        {
          id: "addr-1",
          first_name: "Dr. Alex",
          last_name: "Chen",
          company: "MIT Media Lab",
          address_line_1: "75 Amherst St",
          city: "Cambridge",
          state: "MA",
          postal_code: "02139",
          is_default: true,
        },
      ],
      isLoading: false,
    } as any);

    render(<CheckoutPage />);

    expect(screen.getByDisplayValue("dr.chen@mit.edu")).toBeInTheDocument();
  });

  it("4. Empty Bag State: displays empty state when cart has 0 items", () => {
    vi.mocked(useCart).mockReturnValue({
      data: { ...mockCartData, items: [], items_count: 0 },
      isLoading: false,
    } as any);

    render(<CheckoutPage />);

    expect(screen.getByText("Your Shopping Bag is Empty")).toBeInTheDocument();
  });

  it("5. Order Confirmation Page: renders confirmed order details, copy button, and timeline", () => {
    vi.mocked(useCustomerOrder).mockReturnValue({
      data: {
        id: "ord-1",
        order_number: "ORD-2026-0001",
        status: "pending",
        total_amount: 549.99,
        subtotal: 549.99,
        item_count: 1,
        items: [
          {
            id: "oi-1",
            order_id: "ord-1",
            product_name: "Neural Interface V2 Pro",
            sku: "NIV2-PRO",
            unit_price: 549.99,
            quantity: 1,
            total_price: 549.99,
          },
        ],
        shipping_address: {
          first_name: "Sarah",
          last_name: "Connor",
          address_line_1: "77 Massachusetts Ave",
          city: "Cambridge",
          state: "MA",
          postal_code: "02139",
          country_code: "US",
        },
      } as any,
      isLoading: false,
      isError: false,
      refetch: mockRefetchOrder,
    } as any);

    render(<CheckoutSuccessPage />);

    expect(screen.getByText("Thank you for your order!")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText("01. Order Recorded")).toBeInTheDocument();
    expect(screen.getByText("02. Hardware Testing")).toBeInTheDocument();
    expect(screen.getByText("03. Courier Dispatch")).toBeInTheDocument();

    // Copy order number button
    const copyBtn = screen.getByRole("button", { name: /copy order number/i });
    expect(copyBtn).toBeInTheDocument();
  });

  it("6. Order Confirmation Print Action: triggers window.print on print button click", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});

    vi.mocked(useCustomerOrder).mockReturnValue({
      data: {
        id: "ord-1",
        order_number: "ORD-2026-0001",
        total_amount: 549.99,
      } as any,
      isLoading: false,
      isError: false,
    } as any);

    render(<CheckoutSuccessPage />);

    const printBtn = screen.getByRole("button", { name: /print receipt/i });
    fireEvent.click(printBtn);
    expect(printSpy).toHaveBeenCalled();
  });
});
