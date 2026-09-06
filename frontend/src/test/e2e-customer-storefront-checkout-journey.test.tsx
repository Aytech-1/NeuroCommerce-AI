import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import StoreHomePage from "@/app/(store)/page";
import ProductsPage from "@/app/(store)/products/page";
import ProductDetailPage from "@/app/(store)/products/[slug]/page";
import CartPage from "@/app/(store)/cart/page";
import CheckoutPage from "@/app/(store)/checkout/page";
import CheckoutSuccessPage from "@/app/(store)/checkout/success/page";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  useFeaturedProducts,
  useTrendingRecommendations,
  usePublicProducts,
  useProductBySlug,
  useProductReviews,
  useSimilarRecommendations,
  useAddToCart,
  useToggleWishlist,
  useCategoriesTree,
  useBrands,
} from "@/hooks/use-storefront";
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart, useApplyCoupon, useRemoveCoupon } from "@/hooks/use-cart";
import { useShippingRates, useTaxCalculation, useProcessCheckout } from "@/hooks/use-checkout";
import { useCustomerProfile, useCustomerAddresses, useCustomerOrder } from "@/hooks/use-customer";
import { useSearchParams } from "next/navigation";

vi.mock("@/hooks/use-storefront", () => ({
  useStorefrontProducts: vi.fn(),
  useFeaturedProducts: vi.fn(),
  useTrendingRecommendations: vi.fn(),
  useSmartRecommendations: vi.fn().mockReturnValue({ data: { items: [], isPersonalized: false }, isLoading: false, isError: false }),
  usePersonalizedRecommendations: vi.fn().mockReturnValue({ data: [], isLoading: false, isError: false }),
  useRecentlyViewedRecommendations: vi.fn().mockReturnValue({ data: [], isLoading: false, isError: false }),
  useDealsProducts: vi.fn().mockReturnValue({ data: { data: [] }, isLoading: false, isError: false }),
  usePublicProducts: vi.fn(),
  useProductBySlug: vi.fn(),
  useProductReviews: vi.fn().mockReturnValue({ data: { data: [] } }),
  useSimilarRecommendations: vi.fn().mockReturnValue({ data: [] }),
  useAddToCart: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useToggleWishlist: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useSubmitReview: vi.fn().mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useStorefrontCategories: vi.fn(),
  useCategoriesTree: vi.fn().mockReturnValue({ data: [{ id: "cat-1", name: "EEG Headsets", slug: "eeg-headsets", children: [] }] }),
  useBrands: vi.fn().mockReturnValue({ data: [{ id: "b-1", name: "NeuroPulse", slug: "neuropulse" }] }),
  useAiRecommendations: vi.fn(),
  useStorefrontBrands: vi.fn().mockReturnValue({ data: [], isLoading: false }),
}));

vi.mock("@/hooks/use-cms", () => ({
  useBlogPosts: vi.fn().mockReturnValue({ data: { data: [] }, isLoading: false, isError: false }),
}));

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
  useProcessCheckout: vi.fn(),
}));

vi.mock("@/hooks/use-customer", () => ({
  useCustomerProfile: vi.fn(),
  useCustomerAddresses: vi.fn(),
  useCustomerOrder: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: vi.fn(),
}));

const mockProduct = {
  id: "prod-1",
  name: "Clinical Neuro-Telemetry Cap V3",
  slug: "clinical-neuro-telemetry-cap-v3",
  sku: "NTC-V3-PRO",
  base_price: 1250.0,
  description: "64-channel research grade wireless EEG headset.",
  status: "active",
  is_active: true,
  is_featured: true,
  category: { id: "cat-1", name: "EEG Headsets", slug: "eeg-headsets" },
  variants: [
    { id: "var-1", name: "64-Channel Medium", sku: "NTC-V3-64M", price: 1250.0, stock: 15, is_active: true },
  ],
  primary_image: { id: "img-1", url: "/mock-eeg.jpg", is_primary: true },
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

const mockCart = {
  id: "cart-1",
  items_count: 1,
  subtotal: 1250.0,
  discount_total: 0,
  tax_total: 0,
  shipping_total: 0,
  grand_total: 1250.0,
  items: [
    {
      id: "item-1",
      cart_id: "cart-1",
      product_id: "prod-1",
      quantity: 1,
      unit_price: 1250.0,
      subtotal: 1250.0,
      product: mockProduct,
    },
  ],
};

describe("End-to-End Customer Storefront & Checkout Journey", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({ user: null, isAuthenticated: false, token: null });
    useCartStore.setState({ itemCount: 1, isOpen: false });

    vi.mocked(useCategoriesTree).mockReturnValue({ data: [{ id: "cat-1", name: "EEG Headsets", slug: "eeg-headsets", children: [] }], isLoading: false } as any);
    vi.mocked(useBrands).mockReturnValue({ data: [{ id: "b-1", name: "NeuroPulse", slug: "neuropulse" }], isLoading: false } as any);
    vi.mocked(usePublicProducts).mockReturnValue({ data: { data: [mockProduct], meta: { current_page: 1, per_page: 12, total: 1, last_page: 1 } }, isLoading: false } as any);
    vi.mocked(useFeaturedProducts).mockReturnValue({ data: [mockProduct], isLoading: false } as any);
    vi.mocked(useTrendingRecommendations).mockReturnValue({ data: [mockProduct], isLoading: false } as any);
    vi.mocked(useProductBySlug).mockReturnValue({ data: mockProduct, isLoading: false } as any);

    vi.mocked(useCart).mockReturnValue({ data: mockCart, isLoading: false } as any);
    vi.mocked(useUpdateCartItem).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    vi.mocked(useRemoveCartItem).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    vi.mocked(useClearCart).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    vi.mocked(useApplyCoupon).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    vi.mocked(useRemoveCoupon).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);

    vi.mocked(useShippingRates).mockReturnValue({
      data: [{ id: "std", name: "Standard Ground Delivery", carrier: "USPS", cost: 0.0, estimated_days: "3-5 days" }],
      isLoading: false,
    } as any);

    vi.mocked(useTaxCalculation).mockReturnValue({ data: { tax_rate: 0, tax_amount: 0, jurisdiction: "US" }, isLoading: false } as any);
    vi.mocked(useProcessCheckout).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    vi.mocked(useCustomerProfile).mockReturnValue({ data: null, isLoading: false } as any);
    vi.mocked(useCustomerAddresses).mockReturnValue({ data: [], isLoading: false } as any);
    vi.mocked(useSearchParams).mockReturnValue({ get: (key: string) => (key === "order_number" ? "ORD-2026-9999" : "ord-9999") } as any);
  });

  it("1. Home Discovery: renders storefront hero and featured neuroscience devices", () => {
    render(<StoreHomePage />);
    expect(screen.getByText(/Precision Technology/i)).toBeInTheDocument();
    expect(screen.getAllByText("Clinical Neuro-Telemetry Cap V3").length).toBeGreaterThanOrEqual(1);
  });

  it("2. Full Catalog Discovery: displays faceted products with pricing", () => {
    render(<ProductsPage />);
    expect(screen.getByText("Hardware Catalog")).toBeInTheDocument();
    expect(screen.getByText("Clinical Neuro-Telemetry Cap V3")).toBeInTheDocument();
  });

  it("3. Product Detail & Selection: allows variant inspection and add-to-bag action", async () => {
    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ slug: "clinical-neuro-telemetry-cap-v3" })} />);
    });
    expect(screen.getAllByText("Clinical Neuro-Telemetry Cap V3").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("64-channel research grade wireless EEG headset.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add to cart/i })).toBeInTheDocument();
  });

  it("4. Shopping Bag Review: renders authoritative subtotal and checkout link", () => {
    render(<CartPage />);
    expect(screen.getByText("Shopping Bag")).toBeInTheDocument();
    expect(screen.getByText("Clinical Neuro-Telemetry Cap V3")).toBeInTheDocument();
    expect(screen.getAllByText("₦1,250.00").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /proceed to checkout/i })).toBeInTheDocument();
  });

  it("5. Multi-Step Checkout: completes contact, shipping, and payment placement", () => {
    const mockProcess = vi.fn();
    vi.mocked(useProcessCheckout).mockReturnValue({ mutate: mockProcess, isPending: false } as any);

    render(<CheckoutPage />);
    expect(screen.getByText("Checkout & Hardware Acquisition")).toBeInTheDocument();

    // Step 1: Contact
    fireEvent.change(screen.getByPlaceholderText("Sarah"), { target: { value: "Dr. Alan" } });
    fireEvent.change(screen.getByPlaceholderText("Connor"), { target: { value: "Grant" } });
    fireEvent.change(screen.getByPlaceholderText("sarah.connor@cyberdyne.lab"), { target: { value: "alan@oxford.neuro.ac.uk" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to delivery address/i }));

    // Step 2: Address
    fireEvent.change(screen.getByPlaceholderText("77 Massachusetts Avenue, Building E25"), { target: { value: "South Parks Road" } });
    fireEvent.change(screen.getByPlaceholderText("Cambridge"), { target: { value: "Oxford" } });
    fireEvent.change(screen.getByPlaceholderText("02139"), { target: { value: "OX1 3QU" } });
    fireEvent.click(screen.getByRole("button", { name: /continue to shipping method/i }));

    // Step 3: Shipping
    fireEvent.click(screen.getByRole("button", { name: /continue to payment/i }));

    // Step 4: Authorize
    fireEvent.click(screen.getByRole("button", { name: /authorize & place order/i }));

    expect(mockProcess).toHaveBeenCalledWith(
      expect.objectContaining({
        guest_email: "alan@oxford.neuro.ac.uk",
        guest_first_name: "Dr. Alan",
        payment_method: "stripe",
      })
    );
  });

  it("6. Order Confirmation: displays confirmed laboratory order and receipt details", () => {
    vi.mocked(useCustomerOrder).mockReturnValue({
      data: {
        id: "ord-9999",
        order_number: "ORD-2026-9999",
        status: "pending",
        total_amount: 1250.0,
        subtotal: 1250.0,
        item_count: 1,
        items: [
          {
            id: "oi-1",
            order_id: "ord-9999",
            product_name: "Clinical Neuro-Telemetry Cap V3",
            sku: "NTC-V3-PRO",
            unit_price: 1250.0,
            quantity: 1,
            total_price: 1250.0,
          },
        ],
        shipping_address: {
          first_name: "Dr. Alan",
          last_name: "Grant",
          address_line_1: "South Parks Road",
          city: "Oxford",
          postal_code: "OX1 3QU",
          country_code: "GB",
        },
      } as any,
      isLoading: false,
    } as any);

    render(<CheckoutSuccessPage />);
    expect(screen.getByText("Thank you for your order!")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-9999")).toBeInTheDocument();
    expect(screen.getByText("Clinical Neuro-Telemetry Cap V3")).toBeInTheDocument();
    expect(screen.getByText("Print Receipt")).toBeInTheDocument();
  });
});
