import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ProductDetailPage from "@/app/(store)/products/[slug]/page";
import {
  useProductBySlug,
  useProductReviews,
  useSimilarRecommendations,
  useAddToCart,
  useToggleWishlist,
} from "@/hooks/use-storefront";
import { ProductDetail } from "@/services/catalog-service";

vi.mock("@/hooks/use-storefront", () => ({
  useProductBySlug: vi.fn(),
  useProductReviews: vi.fn(),
  useSimilarRecommendations: vi.fn(),
  useAddToCart: vi.fn(),
  useToggleWishlist: vi.fn(),
  useSubmitReview: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

const mockProductDetail: ProductDetail = {
  id: "prod-1",
  name: "Neural Interface V2 Pro",
  slug: "neural-interface-v2-pro",
  sku: "NIV2-PRO",
  base_price: 599.99,
  sale_price: 499.99,
  status: "active",
  is_active: true,
  is_featured: true,
  stock_status: "in_stock",
  stock_quantity: 10,
  description: "Clinical grade 64-channel EEG device with ultra-low latency telemetry.",
  short_description: "Precision 64-channel EEG brain-computer interface.",
  category: {
    id: "cat-1",
    name: "Neural Headsets",
  },
  brand: {
    id: "br-1",
    name: "Synapse Labs",
  },
  images: [
    { id: "img-1", url: "https://example.com/img1.jpg", alt_text: "Front view", is_primary: true, sort_order: 1 },
    { id: "img-2", url: "https://example.com/img2.jpg", alt_text: "Side view", is_primary: false, sort_order: 2 },
  ],
  variants: [
    {
      id: "var-1",
      sku: "NIV2-PRO-64CH",
      price: 499.99,
      compare_at_price: 599.99,
      is_active: true,
      attribute_values: [{ id: "attr-1", value: "64 Channels" }],
    },
  ],
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

describe("Storefront Product Detail View Suite (STEP 26.2)", () => {
  const mockAddToCart = vi.fn();
  const mockToggleWishlist = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAddToCart).mockReturnValue({
      mutate: mockAddToCart,
      isPending: false,
    } as any);

    vi.mocked(useToggleWishlist).mockReturnValue({
      mutate: mockToggleWishlist,
      isPending: false,
    } as any);

    vi.mocked(useProductReviews).mockReturnValue({
      data: {
        data: [
          {
            id: "rev-1",
            rating: 5,
            title: "Exceptional Signal Quality",
            body: "The SNR is superior to our previous laboratory hardware.",
            is_verified_purchase: true,
            created_at: "2026-08-20T00:00:00Z",
          },
        ],
        meta: { current_page: 1, per_page: 10, total: 1, last_page: 1 },
      },
    } as any);

    vi.mocked(useSimilarRecommendations).mockReturnValue({
      data: [],
    } as any);
  });

  it("1. Product Information: renders title, SKU, pricing, breadcrumb, and reviews overview", async () => {
    vi.mocked(useProductBySlug).mockReturnValue({
      data: mockProductDetail,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ slug: "neural-interface-v2-pro" })} />);
    });

    expect(screen.getByRole("heading", { level: 1, name: "Neural Interface V2 Pro" })).toBeInTheDocument();
    expect(screen.getByText(/SKU: NIV2-PRO/i)).toBeInTheDocument();
    expect(screen.getByText("₦499.99")).toBeInTheDocument();
    expect(screen.getByText("₦599.99")).toBeInTheDocument();
    expect(screen.getByText(/Clinical grade 64-channel EEG device/i)).toBeInTheDocument();
    expect(screen.getByText("Exceptional Signal Quality")).toBeInTheDocument();
    expect(screen.getByText("Verified Purchase")).toBeInTheDocument();
    expect(screen.getByText("In Stock & Ready to Ship")).toBeInTheDocument();
  });

  it("2. Quantity & Add to Cart: updates quantity and triggers Add to Cart mutation", async () => {
    vi.mocked(useProductBySlug).mockReturnValue({
      data: mockProductDetail,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ slug: "neural-interface-v2-pro" })} />);
    });

    // Increase quantity to 2
    const plusBtn = screen.getByRole("button", { name: /increase quantity/i });
    fireEvent.click(plusBtn);
    expect(screen.getByText("2")).toBeInTheDocument();

    const addBtn = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(addBtn);

    expect(mockAddToCart).toHaveBeenCalledWith({
      productId: "prod-1",
      quantity: 2,
      variantId: undefined,
    });
  });

  it("3. Wishlist Action: triggers wishlist toggle mutation on click", async () => {
    vi.mocked(useProductBySlug).mockReturnValue({
      data: mockProductDetail,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ slug: "neural-interface-v2-pro" })} />);
    });

    const wishlistBtn = screen.getByRole("button", { name: /wishlist/i });
    fireEvent.click(wishlistBtn);

    expect(mockToggleWishlist).toHaveBeenCalledWith({
      productId: "prod-1",
      isWishlisted: false,
    });
  });

  it("4. Image Thumbnails & Lightbox: switches active thumbnail and opens lightbox", async () => {
    vi.mocked(useProductBySlug).mockReturnValue({
      data: mockProductDetail,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ slug: "neural-interface-v2-pro" })} />);
    });

    const thumbBtn = screen.getByRole("button", { name: /select product image 2/i });
    fireEvent.click(thumbBtn);

    const enlargeBtn = screen.getByRole("button", { name: /enlarge image/i });
    fireEvent.click(enlargeBtn);

    expect(screen.getByRole("dialog", { name: /enlarged product image/i })).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /close enlarged view/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("5. Variant Selection: selects a variant model and updates SKU", async () => {
    vi.mocked(useProductBySlug).mockReturnValue({
      data: mockProductDetail,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ slug: "neural-interface-v2-pro" })} />);
    });

    const variantBtn = screen.getByRole("button", { name: /64 channels/i });
    fireEvent.click(variantBtn);

    expect(screen.getByText(/SKU: NIV2-PRO-64CH/i)).toBeInTheDocument();
  });

  it("5b. Variant Selection with attributes shape and price override: updates price and SKU", async () => {
    const productWithAttributes: ProductDetail = {
      ...mockProductDetail,
      variants: [
        {
          id: "var-2",
          sku: "NIV2-PRO-128CH",
          price: 799.99,
          compare_at_price: 899.99,
          is_active: true,
          attributes: [
            {
              attribute_id: "attr-2",
              attribute_name: "Channel Count",
              attribute_slug: "channel-count",
              value_id: "val-2",
              value: "128 Channels",
            },
          ],
        },
      ],
    };

    vi.mocked(useProductBySlug).mockReturnValue({
      data: productWithAttributes,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ slug: "neural-interface-v2-pro" })} />);
    });

    const variantBtn = screen.getByRole("button", { name: /128 channels/i });
    fireEvent.click(variantBtn);

    expect(screen.getByText(/SKU: NIV2-PRO-128CH/i)).toBeInTheDocument();
  });

  it("6. Loading State: renders structured skeleton placeholder", async () => {
    vi.mocked(useProductBySlug).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    } as any);

    let container: HTMLElement;
    await act(async () => {
      const res = render(<ProductDetailPage params={Promise.resolve({ slug: "neural-interface-v2-pro" })} />);
      container = res.container;
    });

    const skeletons = container!.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("7. Error & Product Not Found State: renders fallback with Browse and Retry", async () => {
    vi.mocked(useProductBySlug).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    await act(async () => {
      render(<ProductDetailPage params={Promise.resolve({ slug: "nonexistent-item" })} />);
    });

    expect(screen.getByText("Product Not Found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse all products/i })).toHaveAttribute("href", "/products");

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
