import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CustomerWishlistPage from "@/app/(portal)/account/wishlist/page";
import {
  useCustomerWishlist,
  useMoveWishlistToCart,
  useRemoveWishlistItem,
} from "@/hooks/use-customer";

vi.mock("@/hooks/use-customer", () => ({
  useCustomerWishlist: vi.fn(),
  useMoveWishlistToCart: vi.fn(),
  useRemoveWishlistItem: vi.fn(),
}));

const mockWishlistItem1 = {
  id: "w-1",
  product_id: "prod-1",
  product: {
    id: "prod-1",
    name: "Neural Interface V2 Pro",
    base_price: 549.99,
    slug: "neural-interface-v2-pro",
    primary_image: { url: "/images/neural-interface.png" },
  },
  variant: {
    id: "var-1",
    sku: "NIV2-PRO",
  },
};

const mockWishlistItem2 = {
  id: "w-2",
  product_id: "prod-2",
  product: {
    id: "prod-2",
    name: "EEG Wireless Cap",
    base_price: 299.0,
    slug: "eeg-wireless-cap",
  },
  variant: null,
};

describe("Customer Wishlist & Saved Products Suite (STEP 26.10)", () => {
  const mockMoveToCart = vi.fn();
  const mockRemoveItem = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCustomerWishlist).mockReturnValue({
      data: {
        items: [mockWishlistItem1, mockWishlistItem2],
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    vi.mocked(useMoveWishlistToCart).mockReturnValue({
      mutate: mockMoveToCart,
      isPending: false,
    } as any);

    vi.mocked(useRemoveWishlistItem).mockReturnValue({
      mutate: mockRemoveItem,
      isPending: false,
    } as any);
  });

  it("1. Header & Count: renders eyebrow, title, and authoritative item count", () => {
    render(<CustomerWishlistPage />);

    expect(screen.getByText("SAVED HARDWARE")).toBeInTheDocument();
    expect(screen.getByText("My Wishlist")).toBeInTheDocument();
    expect(screen.getByText("2 saved products")).toBeInTheDocument();
  });

  it("2. Product Cards: renders product details, prices, and In Stock status", () => {
    render(<CustomerWishlistPage />);

    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();
    expect(screen.getByText("EEG Wireless Cap")).toBeInTheDocument();
    expect(screen.getByText("SKU: NIV2-PRO")).toBeInTheDocument();
    expect(screen.getByText("$549.99")).toBeInTheDocument();
    expect(screen.getByText("$299.00")).toBeInTheDocument();
    expect(screen.getAllByText("In Stock").length).toBe(2);
  });

  it("3. Move to Shopping Bag: triggers move-to-cart mutation", () => {
    render(<CustomerWishlistPage />);

    const moveBtns = screen.getAllByRole("button", { name: /move to shopping bag/i });
    expect(moveBtns.length).toBe(2);

    fireEvent.click(moveBtns[0]);
    expect(mockMoveToCart).toHaveBeenCalledWith("prod-1");
  });

  it("4. Remove Item: triggers delete mutation with accessible label", () => {
    render(<CustomerWishlistPage />);

    const removeBtn = screen.getByRole("button", { name: /remove neural interface v2 pro from wishlist/i });
    fireEvent.click(removeBtn);

    expect(mockRemoveItem).toHaveBeenCalledWith("prod-1");
  });

  it("5. Empty State: renders fallback when wishlist has no items", () => {
    vi.mocked(useCustomerWishlist).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CustomerWishlistPage />);

    expect(screen.getByText("Your Wishlist is Empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore products/i })).toHaveAttribute("href", "/products");
  });

  it("6. Error State: displays error card and triggers retry", () => {
    vi.mocked(useCustomerWishlist).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<CustomerWishlistPage />);

    expect(screen.getByText("Unable to load your wishlist")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);

    expect(mockRefetch).toHaveBeenCalled();
  });
});
