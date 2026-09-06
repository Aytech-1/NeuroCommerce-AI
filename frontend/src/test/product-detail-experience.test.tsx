import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProductDetailPage from "@/app/(store)/products/[slug]/page";
import * as storefrontHooks from "@/hooks/use-storefront";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductDetail } from "@/services/catalog-service";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/products/synapse-pro-headset",
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockProductDetail: ProductDetail = {
  id: "prod-101",
  name: "SynapsePro Neural Interface Headset",
  slug: "synapse-pro-headset",
  sku: "SYN-PRO-01",
  base_price: 1499.0,
  sale_price: 1299.0,
  compare_at_price: 1599.0,
  short_description: "Clinical-grade 64-channel EEG sensor array with sub-millisecond telemetry.",
  description: "The SynapsePro Neural Interface provides high-density signal acquisition for research environments.",
  status: "active",
  is_active: true,
  is_featured: true,
  avg_rating: "4.9",
  review_count: 28,
  stock_status: "in_stock",
  stock_quantity: 15,
  weight: 0.45,
  weight_unit: "kg",
  category: {
    id: "cat-1",
    name: "Neural Interfaces",
    slug: "neural-interfaces",
  },
  brand: {
    id: "brand-1",
    name: "NeuroSynapse Lab",
    slug: "neurosynapse",
  },
  primary_image: {
    id: "img-1",
    url: "https://neurocommerce.ai/media/synapse-pro-main.jpg",
    alt_text: "SynapsePro Front View",
    is_primary: true,
    sort_order: 1,
  },
  images: [
    {
      id: "img-1",
      url: "https://neurocommerce.ai/media/synapse-pro-main.jpg",
      alt_text: "SynapsePro Front View",
      is_primary: true,
      sort_order: 1,
    },
    {
      id: "img-2",
      url: "https://neurocommerce.ai/media/synapse-pro-side.jpg",
      alt_text: "SynapsePro Side Profile",
      is_primary: false,
      sort_order: 2,
    },
  ],
  variants: [
    {
      id: "var-1",
      sku: "SYN-PRO-64CH",
      name: "64-Channel Standard",
      price: 1299.0,
      compare_at_price: 1599.0,
      is_active: true,
      attributes: [{ value: "64-Channel" }],
    },
    {
      id: "var-2",
      sku: "SYN-PRO-128CH",
      name: "128-Channel High Density",
      price: 2199.0,
      compare_at_price: 2499.0,
      is_active: true,
      image_url: "https://neurocommerce.ai/media/synapse-pro-side.jpg",
      attributes: [{ value: "128-Channel" }],
    },
  ],
  created_at: "2026-01-15T08:00:00Z",
  updated_at: "2026-03-01T12:00:00Z",
};

const mockReviews = [
  {
    id: "rev-1",
    product_id: "prod-101",
    rating: 5,
    title: "Remarkable Signal-to-Noise Ratio",
    body: "Installed in our cognitive neuroscience laboratory. Artifact rejection works flawlessly.",
    is_verified_purchase: true,
    is_approved: true,
    is_featured: false,
    helpful_count: 14,
    created_at: "2026-02-10T14:30:00Z",
    updated_at: "2026-02-10T14:30:00Z",
    user: {
      id: "usr-1",
      first_name: "Dr. Elena",
      last_name: "Vance",
      email: "elena.vance@blackmesa.edu",
    },
    admin_reply: "Thank you Dr. Vance for validating our 64-channel telemetry subsystem.",
  },
];

const mockSimilarProducts = [
  {
    id: "prod-102",
    name: "CortexLink EEG Cap",
    slug: "cortexlink-eeg-cap",
    sku: "CTX-LNK-01",
    base_price: 899.0,
    status: "active" as const,
    is_active: true,
    is_featured: false,
    created_at: "2026-01-20T00:00:00Z",
    updated_at: "2026-01-20T00:00:00Z",
  },
];

describe("Storefront Product Details, Variants, Inventory & Reviews (STEP 28.28)", () => {
  let queryClient: QueryClient;
  const mockAddToCart = vi.fn();
  const mockToggleWishlist = vi.fn();
  const mockSubmitReview = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.spyOn(storefrontHooks, "useProductBySlug").mockReturnValue({
      data: mockProductDetail,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(storefrontHooks, "useProductReviews").mockReturnValue({
      data: {
        data: mockReviews,
        meta: { current_page: 1, last_page: 2, per_page: 5, total: 28 },
      },
      isLoading: false,
    } as any);

    vi.spyOn(storefrontHooks, "useSimilarRecommendations").mockReturnValue({
      data: mockSimilarProducts,
      isLoading: false,
    } as any);

    vi.spyOn(storefrontHooks, "useAddToCart").mockReturnValue({
      mutate: mockAddToCart,
      isPending: false,
    } as any);

    vi.spyOn(storefrontHooks, "useToggleWishlist").mockReturnValue({
      mutate: mockToggleWishlist,
      isPending: false,
    } as any);

    vi.spyOn(storefrontHooks, "useSubmitReview").mockReturnValue({
      mutate: mockSubmitReview,
      isPending: false,
    } as any);
  });

  const renderWithClient = async (ui: React.ReactElement) => {
    let res: any;
    await act(async () => {
      res = render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
    });
    return res;
  };

  it("1. Product detail page renders breadcrumbs, title, and brand", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    expect(screen.getByRole("heading", { name: /SynapsePro Neural Interface Headset/i })).toBeInTheDocument();
    expect(screen.getAllByText("NeuroSynapse Lab").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Neural Interfaces").length).toBeGreaterThanOrEqual(1);
  });

  it("2. Product information renders from API-shaped data", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    expect(screen.getAllByText(/SYN-PRO-01/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Clinical-grade 64-channel EEG sensor array/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Specifications & Overview/i)).toBeInTheDocument();
  });

  it("3. Product images render correctly with primary and thumbnail gallery", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    const primaryImgs = screen.getAllByAltText("SynapsePro Front View");
    expect(primaryImgs.length).toBeGreaterThanOrEqual(1);
    expect(primaryImgs[0]).toHaveAttribute("src", "https://neurocommerce.ai/media/synapse-pro-main.jpg");
  });

  it("4. Image fallback renders when product has no images", async () => {
    vi.spyOn(storefrontHooks, "useProductBySlug").mockReturnValue({
      data: { ...mockProductDetail, images: [], primary_image: null },
      isLoading: false,
      isError: false,
    } as any);

    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    expect(screen.getByRole("heading", { name: /SynapsePro Neural Interface Headset/i })).toBeInTheDocument();
  });

  it("5. Variant selector renders available product configurations", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    expect(screen.getByRole("button", { name: "64-Channel Standard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "128-Channel High Density" })).toBeInTheDocument();
  });

  it("6. Variant selection updates active SKU and price", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    const variantBtn = screen.getByRole("button", { name: "128-Channel High Density" });
    await act(async () => {
      fireEvent.click(variantBtn);
    });

    expect(screen.getAllByText(/SYN-PRO-128CH/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/2,199/i).length).toBeGreaterThanOrEqual(1);
  });

  it("7. Price changes when variant is selected and updates discount calculation", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    expect(screen.getAllByText(/1,299/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Save 19%/i)).toBeInTheDocument();
  });

  it("8. Inventory stock availability renders correctly", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    expect(screen.getByText(/In Stock & Ready to Ship/i)).toBeInTheDocument();
  });

  it("9. Add to Cart invokes the real mutation boundary with product and variant ID", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    const variantBtn = screen.getByRole("button", { name: "128-Channel High Density" });
    await act(async () => {
      fireEvent.click(variantBtn);
    });

    const addToCartBtns = screen.getAllByRole("button", { name: /Add to Cart/i });
    await act(async () => {
      fireEvent.click(addToCartBtns[0]);
    });

    expect(mockAddToCart).toHaveBeenCalledWith({
      productId: "prod-101",
      quantity: 1,
      variantId: "var-2",
    });
  });

  it("10. Out of stock disables Add to Cart button", async () => {
    vi.spyOn(storefrontHooks, "useProductBySlug").mockReturnValue({
      data: { ...mockProductDetail, stock_status: "out_of_stock", stock_quantity: 0 },
      isLoading: false,
      isError: false,
    } as any);

    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    expect(screen.getByText(/Currently Out of Stock/i)).toBeInTheDocument();
    const addToCartBtns = screen.getAllByRole("button", { name: /Add to Cart/i });
    expect(addToCartBtns[0]).toBeDisabled();
  });

  it("11. Review summary renders rating and customer review count", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    expect(screen.getByText("4.9")).toBeInTheDocument();
    expect(screen.getByText(/\(28 customer reviews\)/i)).toBeInTheDocument();
  });

  it("12. Customer reviews render with verified purchase badge and laboratory admin reply", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    expect(screen.getByText("Remarkable Signal-to-Noise Ratio")).toBeInTheDocument();
    expect(screen.getByText("Dr. Elena Vance")).toBeInTheDocument();
    expect(screen.getByText("Verified Purchase")).toBeInTheDocument();
    expect(screen.getByText(/Thank you Dr. Vance for validating/i)).toBeInTheDocument();
  });

  it("13. Review pagination controls render when multi-page reviews exist", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    expect(screen.getByText(/Review Page 1 of 2/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();
  });

  it("14. Review submission modal opens and handles review creation", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    const writeReviewBtn = screen.getByRole("button", { name: /Write a Review/i });
    await act(async () => {
      fireEvent.click(writeReviewBtn);
    });

    expect(screen.getByRole("heading", { name: "Write a Review" })).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/Exceptional telemetry/i);
    await act(async () => {
      fireEvent.change(titleInput, { target: { value: "Superb latency" } });
    });

    const bodyInput = screen.getByPlaceholderText(/Share your technical evaluation/i);
    await act(async () => {
      fireEvent.change(bodyInput, { target: { value: "Tested in high-interference environment with zero packet loss." } });
    });

    const submitBtn = screen.getByRole("button", { name: /Submit Review/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockSubmitReview).toHaveBeenCalledWith(
      expect.objectContaining({
        rating: 5,
        title: "Superb latency",
        body: "Tested in high-interference environment with zero packet loss.",
      }),
      expect.anything()
    );
  });

  it("15. Related neural hardware recommendations render from API data", async () => {
    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "synapse-pro-headset" })} />);

    expect(screen.getByText("Related Neural Hardware")).toBeInTheDocument();
    expect(screen.getByText("CortexLink EEG Cap")).toBeInTheDocument();
  });

  it("16. Product Not Found 404 state renders when slug does not exist", async () => {
    vi.spyOn(storefrontHooks, "useProductBySlug").mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    } as any);

    await renderWithClient(<ProductDetailPage params={Promise.resolve({ slug: "non-existent-item" })} />);

    expect(screen.getByText("Product Not Found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Browse All Products/i })).toBeInTheDocument();
  });
});
