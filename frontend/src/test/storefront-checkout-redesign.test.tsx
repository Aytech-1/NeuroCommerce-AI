import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CheckoutPage from "@/app/(store)/checkout/page";
import { useCart } from "@/hooks/use-cart";
import { useCustomerProfile, useCustomerAddresses } from "@/hooks/use-customer";
import { useShippingRates, useTaxCalculation, useProcessCheckout } from "@/hooks/use-checkout";
import { useAuthStore } from "@/stores/auth-store";
import { CartData } from "@/services/cart-service";

vi.mock("@/hooks/use-cart", () => ({
  useCart: vi.fn(),
}));

vi.mock("@/hooks/use-customer", () => ({
  useCustomerProfile: vi.fn(),
  useCustomerAddresses: vi.fn(),
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
}));

const mockCart: CartData = {
  id: "cart-500",
  items_count: 2,
  subtotal: 1899.0,
  discount_total: 100.0,
  tax_total: 0,
  shipping_total: 0,
  grand_total: 1799.0,
  coupon_code: "SUMMER100",
  items: [
    {
      id: "ci-1",
      cart_id: "cart-500",
      product_id: "prod-1",
      quantity: 1,
      unit_price: 1399.0,
      subtotal: 1399.0,
      product: {
        id: "prod-1",
        name: "CortexLink Pro BCI Headband",
        slug: "cortexlink-pro-bci",
        sku: "CLP-01",
        base_price: 1399.0,
        status: "active",
        is_active: true,
        is_featured: true,
        brand: { id: "b1", name: "CortexDynamics" },
        created_at: "2026-08-20T00:00:00Z",
        updated_at: "2026-08-20T00:00:00Z",
      },
      created_at: "2026-08-20T00:00:00Z",
      updated_at: "2026-08-20T00:00:00Z",
    },
    {
      id: "ci-2",
      cart_id: "cart-500",
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
        status: "active",
        is_active: true,
        is_featured: false,
        brand: { id: "b2", name: "Synaptic Systems" },
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
    cost: 25.0,
    estimated_days: "1-2 business days",
  },
];

describe("STEP 28.4 — Storefront Checkout Experience & Order Submission Suite", () => {
  const mockProcessCheckout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });

    vi.mocked(useCart).mockReturnValue({
      data: mockCart,
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
      data: { tax_rate: 0.05, tax_amount: 89.95, jurisdiction: "US-MA" },
      isLoading: false,
    } as any);

    vi.mocked(useProcessCheckout).mockReturnValue({
      mutate: mockProcessCheckout,
      isPending: false,
    } as any);
  });

  it("1. Checkout Load: renders breadcrumb, single H1, and secure checkout eyebrow", () => {
    render(<CheckoutPage />);

    // Breadcrumb landmark
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Shopping Bag" })).toHaveAttribute("href", "/cart");

    // Single H1
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Checkout & Hardware Acquisition");

    expect(screen.getByText("SECURE CHECKOUT")).toBeInTheDocument();
  });

  it("2. Step Transitions: navigates across Contact -> Delivery -> Shipping -> Payment steps", () => {
    render(<CheckoutPage />);

    // Step 1: Contact
    expect(screen.getByText("1. Researcher Contact Information")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Sarah"), { target: { value: "Elena" } });
    fireEvent.change(screen.getByPlaceholderText("Connor"), { target: { value: "Rostova" } });
    fireEvent.change(screen.getByPlaceholderText("sarah.connor@cyberdyne.lab"), {
      target: { value: "elena@neuro.org" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continue to delivery address/i }));

    // Step 2: Delivery
    expect(screen.getByText("2. Laboratory Shipping Destination")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("77 Massachusetts Avenue, Building E25"), {
      target: { value: "450 Serra Mall" },
    });
    fireEvent.change(screen.getByPlaceholderText("Cambridge"), { target: { value: "Stanford" } });
    fireEvent.change(screen.getByPlaceholderText("02139"), { target: { value: "94305" } });

    fireEvent.click(screen.getByRole("button", { name: /continue to shipping method/i }));

    // Step 3: Shipping
    expect(screen.getByText("3. Select Logistics & Courier Method")).toBeInTheDocument();
    expect(screen.getByText("Standard Ground Delivery")).toBeInTheDocument();
    expect(screen.getByText("Express Air Delivery")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    // Step 4: Payment
    expect(screen.getByText("4. Secure Payment Method")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /credit \/ debit card/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /paypal \/ institutional/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /po \/ wire invoice/i })).toBeInTheDocument();

    // Place order
    const placeOrderBtn = screen.getByRole("button", { name: /authorize & place order/i });
    fireEvent.click(placeOrderBtn);

    expect(mockProcessCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_method: "stripe",
        shipping_method: "Standard Ground Delivery",
        guest_email: "elena@neuro.org",
        guest_first_name: "Elena",
        guest_last_name: "Rostova",
      })
    );
  });

  it("3. Authenticated Customer Preloading: preloads customer profile and default address", () => {
    useAuthStore.setState({
      user: { id: "usr-1", email: "dr.vance@nih.gov", role: "customer" } as any,
      isAuthenticated: true,
    });

    vi.mocked(useCustomerProfile).mockReturnValue({
      data: {
        id: "usr-1",
        first_name: "Dr. Eli",
        last_name: "Vance",
        email: "dr.vance@nih.gov",
        phone: "+1 (301) 496-4000",
      },
      isLoading: false,
    } as any);

    vi.mocked(useCustomerAddresses).mockReturnValue({
      data: [
        {
          id: "addr-nih",
          first_name: "Dr. Eli",
          last_name: "Vance",
          company: "NIH Neuroscience Division",
          address_line_1: "9000 Rockville Pike",
          city: "Bethesda",
          state: "MD",
          postal_code: "20892",
          country_code: "US",
          is_default: true,
        },
      ],
      isLoading: false,
    } as any);

    render(<CheckoutPage />);

    expect(screen.getByDisplayValue("dr.vance@nih.gov")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Dr. Eli")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Vance")).toBeInTheDocument();
  });

  it("4. Order Review & Sticky Summary: displays line items, financial breakdown, and discount", () => {
    render(<CheckoutPage />);

    expect(screen.getByText("Order Review (2 items)")).toBeInTheDocument();
    expect(screen.getByText("CortexLink Pro BCI Headband")).toBeInTheDocument();
    expect(screen.getByText("Synaptic Telemetry Bio-Amplifier")).toBeInTheDocument();

    expect(screen.getByText("Hardware Subtotal")).toBeInTheDocument();
    expect(screen.getByText("$1,899.00")).toBeInTheDocument();

    expect(screen.getByText("Discount (SUMMER100)")).toBeInTheDocument();
    expect(screen.getByText("-$100.00")).toBeInTheDocument();

    expect(screen.getByText("Estimated Tax")).toBeInTheDocument();
    expect(screen.getByText("$89.95")).toBeInTheDocument();
  });

  it("5. Empty Bag Protection: renders empty state when cart has 0 items", () => {
    vi.mocked(useCart).mockReturnValue({
      data: { ...mockCart, items: [], items_count: 0 },
      isLoading: false,
    } as any);

    render(<CheckoutPage />);

    expect(screen.getByText("Your Shopping Bag is Empty")).toBeInTheDocument();
  });

  it("6. Loading State: renders geometry-matched skeletons when cart is loading", () => {
    vi.mocked(useCart).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    const { container } = render(<CheckoutPage />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });
});
