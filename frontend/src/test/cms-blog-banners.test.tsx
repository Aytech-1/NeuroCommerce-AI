import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminBlogPage from "@/app/(admin)/admin/cms/blog/page";
import AdminBannersPage from "@/app/(admin)/admin/cms/banners/page";
import { useBlogPosts, useBanners } from "@/hooks/use-cms";

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-cms", () => ({
  useBlogPosts: vi.fn(),
  useBanners: vi.fn(),
}));

describe("Admin Blog & Banners Suite", () => {
  it("renders blog articles table", () => {
    vi.mocked(useBlogPosts).mockReturnValue({
      data: {
        data: [
          {
            id: "blog-1",
            title: "BCI Latency Breakthroughs in 2026",
            slug: "bci-latency-breakthroughs",
            content: "Full article text...",
            status: "published",
            category: "Research",
            created_at: "2026-08-20T00:00:00Z",
          },
        ],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminBlogPage />);

    expect(screen.getByText("BCI Latency Breakthroughs in 2026")).toBeInTheDocument();
    expect(screen.getByText("Research")).toBeInTheDocument();
  });

  it("renders promotional banners list", () => {
    vi.mocked(useBanners).mockReturnValue({
      data: {
        data: [
          {
            id: "banner-1",
            title: "Summer Neuro Sale",
            image_url: "https://example.com/banner.jpg",
            link_url: "/catalog/sale",
            position: "home_hero",
            is_active: true,
            order: 1,
            created_at: "2026-08-20T00:00:00Z",
          },
        ],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminBannersPage />);

    expect(screen.getByText("Summer Neuro Sale")).toBeInTheDocument();
    expect(screen.getByText("home_hero")).toBeInTheDocument();
  });
});
