import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminCategoriesPage from "@/app/(admin)/admin/categories/page";
import AdminBrandsPage from "@/app/(admin)/admin/brands/page";
import { useCategories, useBrands } from "@/hooks/use-catalog";

vi.mock("@/hooks/use-catalog", () => ({
  useCategories: vi.fn(),
  useBrands: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

describe("Admin Categories and Brands Suite", () => {
  it("renders categories table with active status", () => {
    vi.mocked(useCategories).mockReturnValue({
      data: [
        {
          id: "cat-1",
          name: "Smart Wearables",
          slug: "smart-wearables",
          description: "Wearable tech devices",
          is_active: true,
          products_count: 14,
        },
      ],
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminCategoriesPage />);

    expect(screen.getByText("Smart Wearables")).toBeInTheDocument();
    expect(screen.getByText("smart-wearables")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders brands table with websites and products count", () => {
    vi.mocked(useBrands).mockReturnValue({
      data: [
        {
          id: "br-1",
          name: "NeuroCore Dynamics",
          slug: "neurocore-dynamics",
          website_url: "https://neurocore.ai",
          is_active: true,
          products_count: 28,
        },
      ],
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminBrandsPage />);

    expect(screen.getByText("NeuroCore Dynamics")).toBeInTheDocument();
    expect(screen.getByText("https://neurocore.ai")).toBeInTheDocument();
    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
