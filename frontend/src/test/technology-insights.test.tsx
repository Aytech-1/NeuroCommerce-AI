import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TechnologyInsights } from "@/components/store/technology-insights";
import { useBlogPosts } from "@/hooks/use-cms";
import { BlogPostItem } from "@/services/cms-service";

vi.mock("@/hooks/use-cms", () => ({
  useBlogPosts: vi.fn(),
}));

const mockArticles: BlogPostItem[] = [
  {
    id: "art-1",
    title: "Advancements in Neural Signal Processing",
    slug: "advancements-in-neural-signal-processing",
    content: "An in-depth guide on real-time noise reduction algorithms for EEG hardware arrays.",
    excerpt: "Exploring next-generation signal processing for ultra-low latency neuroscience devices.",
    status: "published",
    category: "Neuroscience",
    featured_image: "https://example.com/images/neural-signals.jpg",
    published_at: "2026-08-15T00:00:00Z",
    created_at: "2026-08-15T00:00:00Z",
  },
  {
    id: "art-2",
    title: "Selecting Medical-Grade EEG Calibration Equipment",
    slug: "selecting-medical-grade-eeg-calibration",
    content: "Key criteria for evaluating EEG calibration instruments in university research laboratories.",
    excerpt: "A practical evaluation framework for laboratory hardware accuracy and protocol adherence.",
    status: "published",
    category: "Hardware Guides",
    featured_image: null,
    published_at: "2026-08-18T00:00:00Z",
    created_at: "2026-08-18T00:00:00Z",
  },
  {
    id: "art-3",
    title: "Draft Article That Should Be Filtered Out",
    slug: "draft-article-filtered",
    content: "Internal notes only.",
    status: "draft",
    category: "Internal",
    created_at: "2026-08-20T00:00:00Z",
  },
];

describe("Technology Insights & Knowledge Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Section Header: renders eyebrow, H2 heading, subtitle, and View All Insights link", () => {
    vi.mocked(useBlogPosts).mockReturnValue({
      data: { data: mockArticles },
      isLoading: false,
      isError: false,
    } as any);

    render(<TechnologyInsights />);

    // Accessible landmark
    expect(
      screen.getByRole("region", { name: /insights for the future of technology\./i })
    ).toBeInTheDocument();

    // Eyebrow and Heading
    expect(screen.getByText("KNOWLEDGE CENTER")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /insights for the future of technology\./i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Explore research, technology guides, and practical insights/i)
    ).toBeInTheDocument();

    // View All Insights Link
    const viewAllLinks = screen.getAllByRole("link", { name: /view all insights/i });
    expect(viewAllLinks.length).toBeGreaterThanOrEqual(1);
    expect(viewAllLinks[0]).toHaveAttribute("href", "/products");
  });

  it("2. Articles Grid: renders published articles, categories, titles, excerpts and filters drafts", () => {
    vi.mocked(useBlogPosts).mockReturnValue({
      data: { data: mockArticles },
      isLoading: false,
      isError: false,
    } as any);

    const { container } = render(<TechnologyInsights />);

    // Articles should be structured in <article> elements
    const articles = container.querySelectorAll("article");
    expect(articles.length).toBe(2); // art-3 (draft) should be excluded

    // Article 1
    expect(screen.getByText("Neuroscience")).toBeInTheDocument();
    expect(screen.getByText("Advancements in Neural Signal Processing")).toBeInTheDocument();
    expect(
      screen.getByText(/Exploring next-generation signal processing for ultra-low latency/i)
    ).toBeInTheDocument();
    expect(screen.getByText("Aug 15, 2026")).toBeInTheDocument();

    // Featured Image
    const img = screen.getByAltText("Advancements in Neural Signal Processing");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/images/neural-signals.jpg");

    // Article 2
    expect(screen.getByText("Hardware Guides")).toBeInTheDocument();
    expect(screen.getByText("Selecting Medical-Grade EEG Calibration Equipment")).toBeInTheDocument();
    expect(screen.getByText("Aug 18, 2026")).toBeInTheDocument();

    // Draft article not in document
    expect(screen.queryByText("Draft Article That Should Be Filtered Out")).not.toBeInTheDocument();
  });

  it("3. Loading State: displays 3 editorial skeletons during fetch", () => {
    vi.mocked(useBlogPosts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as any);

    const { container } = render(<TechnologyInsights />);
    expect(screen.getByText("Insights for the Future of Technology.")).toBeInTheDocument();
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it("4. Error State: renders clean fallback when CMS API fails", () => {
    vi.mocked(useBlogPosts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    render(<TechnologyInsights />);
    expect(screen.getByText("Insights are temporarily unavailable.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore products/i })).toHaveAttribute("href", "/products");
  });

  it("5. Empty State: renders friendly message when 0 published articles returned", () => {
    vi.mocked(useBlogPosts).mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    } as any);

    render(<TechnologyInsights />);
    expect(screen.getByText("Knowledge Center Coming Soon")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore technology/i })).toHaveAttribute("href", "/products");
  });
});
