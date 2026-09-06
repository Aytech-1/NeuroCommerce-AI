import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturedCategories } from "@/components/store/featured-categories";
import { useCategoriesTree } from "@/hooks/use-storefront";

vi.mock("@/hooks/use-storefront", () => ({
  useCategoriesTree: vi.fn(),
}));

const mockApiCategories = [
  {
    id: "c1",
    name: "Electronics",
    slug: "electronics",
    is_active: true,
    products_count: 4,
    children: [
      { id: "c1-1", name: "Wearables", slug: "wearables", is_active: true, products_count: 1 },
      { id: "c1-2", name: "Audio & Headphones", slug: "audio-headphones", is_active: true, products_count: 2 },
      { id: "c1-3", name: "Smartphones & Tablets", slug: "smartphones-tablets", is_active: true, products_count: 1 },
    ],
  },
  {
    id: "c2",
    name: "Apparel & Fashion",
    slug: "apparel-fashion",
    is_active: true,
    products_count: 1,
    children: [
      { id: "c2-1", name: "Men's Clothing", slug: "mens-clothing", is_active: true, products_count: 1 },
    ],
  },
];

describe("Featured Categories & Shop by Category Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Rendering & Titles: renders eyebrow, H2 heading, supporting copy and dynamic category cards", () => {
    vi.mocked(useCategoriesTree).mockReturnValue({
      data: mockApiCategories,
      isLoading: false,
      isError: false,
    } as any);

    render(<FeaturedCategories />);

    // Section landmarks
    expect(screen.getByRole("region", { name: /shop by category/i })).toBeInTheDocument();
    expect(screen.getByText("EXPLORE OUR COLLECTION")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /shop by category/i })).toBeInTheDocument();
    expect(screen.getByText(/Discover advanced technology, research equipment/i)).toBeInTheDocument();

    // Dynamic Category Titles from tree
    expect(screen.getByText("Wearables")).toBeInTheDocument();
    expect(screen.getByText("Audio & Headphones")).toBeInTheDocument();
    expect(screen.getByText("Smartphones & Tablets")).toBeInTheDocument();
    expect(screen.getByText("Men's Clothing")).toBeInTheDocument();

    // Truthful product counts
    expect(screen.getAllByText("1 Product").length).toBe(3);
    expect(screen.getByText("2 Products")).toBeInTheDocument();

    // Category CTAs
    expect(screen.getAllByText("Explore Category").length).toBeGreaterThanOrEqual(4);
  });

  it("2. Navigation Links: provides correct href for all category cards and View All Categories", () => {
    vi.mocked(useCategoriesTree).mockReturnValue({
      data: mockApiCategories,
      isLoading: false,
      isError: false,
    } as any);

    render(<FeaturedCategories />);

    // View all links
    const viewAllLinks = screen.getAllByRole("link", { name: /view all categories/i });
    expect(viewAllLinks.length).toBeGreaterThanOrEqual(1);
    expect(viewAllLinks[0]).toHaveAttribute("href", "/categories");

    // Category card links
    const wearablesLink = screen.getByRole("link", { name: /wearables/i });
    expect(wearablesLink).toHaveAttribute("href", "/category/wearables");

    const audioLink = screen.getByRole("link", { name: /audio & headphones/i });
    expect(audioLink).toHaveAttribute("href", "/category/audio-headphones");
  });

  it("3. Loading State: displays skeletons when category data is loading", () => {
    vi.mocked(useCategoriesTree).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    const { container } = render(<FeaturedCategories />);

    expect(screen.getByText("Shop by Category")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(6);
  });

  it("4. Error State: displays accessible fallback when categories query fails", () => {
    vi.mocked(useCategoriesTree).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<FeaturedCategories />);

    expect(screen.getByText("Unable to load categories.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore all categories/i })).toHaveAttribute("href", "/categories");
  });
});

