import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturedCategories } from "@/components/store/featured-categories";
import { useCategoriesTree } from "@/hooks/use-storefront";

vi.mock("@/hooks/use-storefront", () => ({
  useCategoriesTree: vi.fn(),
}));

describe("Featured Categories & Shop by Category Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Rendering & Titles: renders eyebrow, H2 heading, supporting copy and 6 category cards", () => {
    vi.mocked(useCategoriesTree).mockReturnValue({
      data: [
        { id: "c1", name: "Neural Hardware", slug: "neural-headsets", is_active: true, products_count: 140 },
        { id: "c2", name: "Medical Devices", slug: "clinical-telemetry", is_active: true, products_count: 88 },
      ],
      isLoading: false,
      isError: false,
    } as any);

    render(<FeaturedCategories />);

    // Section landmarks
    expect(screen.getByRole("region", { name: /shop by category/i })).toBeInTheDocument();
    expect(screen.getByText("EXPLORE OUR COLLECTION")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /shop by category/i })).toBeInTheDocument();
    expect(screen.getByText(/Discover advanced technology, research equipment/i)).toBeInTheDocument();

    // 6 Category Titles
    expect(screen.getByText("Neural Hardware")).toBeInTheDocument();
    expect(screen.getByText("Medical Devices")).toBeInTheDocument();
    expect(screen.getByText("Wearables")).toBeInTheDocument();
    expect(screen.getByText("Laboratory Equipment")).toBeInTheDocument();
    expect(screen.getByText("Accessories & Components")).toBeInTheDocument();
    expect(screen.getByText("New Arrivals")).toBeInTheDocument();

    // Matching API counts
    expect(screen.getByText("140+ Products")).toBeInTheDocument();
    expect(screen.getByText("88+ Products")).toBeInTheDocument();

    // Category CTAs
    expect(screen.getAllByText("Explore Category").length).toBe(6);
  });

  it("2. Navigation Links: provides correct href for all category cards and View All Categories", () => {
    vi.mocked(useCategoriesTree).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    render(<FeaturedCategories />);

    // View all links
    const viewAllLinks = screen.getAllByRole("link", { name: /view all categories/i });
    expect(viewAllLinks.length).toBeGreaterThanOrEqual(1);
    expect(viewAllLinks[0]).toHaveAttribute("href", "/categories");

    // Category card links
    const neuralLink = screen.getByRole("link", { name: /neural hardware/i });
    expect(neuralLink).toHaveAttribute("href", "/category/neural-headsets");
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
