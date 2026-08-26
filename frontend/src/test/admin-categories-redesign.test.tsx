import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminCategoriesPage from "@/app/(admin)/admin/categories/page";
import { useCategories } from "@/hooks/use-catalog";
import { catalogService } from "@/services/catalog-service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/categories",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-catalog", () => ({
  useCategories: vi.fn(),
}));

vi.mock("@/services/catalog-service", () => ({
  catalogService: {
    createCategory: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

const mockCategories = [
  {
    id: "cat-1",
    name: "Neural Interfaces",
    slug: "neural-interfaces",
    description: "Direct brain-computer interfaces and telemetry units",
    is_active: true,
    products_count: 14,
  },
  {
    id: "cat-2",
    name: "Biosensors",
    slug: "biosensors",
    description: "Electrophysiological electrode arrays and dry caps",
    is_active: false,
    products_count: 6,
  },
];

describe("Admin Category Management & Taxonomy Suite (STEP 27.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCategories).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, breadcrumb navigation, and Add Category CTA", () => {
    render(<AdminCategoriesPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("CATALOG TAXONOMY")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Categories", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add category/i })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative total categories, active count, and assigned products", () => {
    render(<AdminCategoriesPage />);

    expect(screen.getByText("Total Categories")).toBeInTheDocument();
    expect(screen.getByText("2 Categories")).toBeInTheDocument();
    expect(screen.getByText("Active Taxonomies")).toBeInTheDocument();
    expect(screen.getByText("1 Active")).toBeInTheDocument();
    expect(screen.getByText("Assigned Products")).toBeInTheDocument();
    expect(screen.getByText("20 Products")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search query and filters categories", () => {
    render(<AdminCategoriesPage />);

    const searchInput = screen.getByPlaceholderText(/search categories/i);
    fireEvent.change(searchInput, { target: { value: "Neural" } });
    expect(searchInput).toHaveValue("Neural");

    expect(screen.getByText("Neural Interfaces")).toBeInTheDocument();
    expect(screen.queryByText("Biosensors")).not.toBeInTheDocument();
  });

  it("4. Categories Table: renders category rows with name, slug, description, and status", () => {
    render(<AdminCategoriesPage />);

    expect(screen.getByText("Neural Interfaces")).toBeInTheDocument();
    expect(screen.getByText("neural-interfaces")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    expect(screen.getByText("Biosensors")).toBeInTheDocument();
    expect(screen.getByText("biosensors")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("5. Creation Dialog Flow: opens modal and submits new category payload", async () => {
    vi.mocked(catalogService.createCategory).mockResolvedValueOnce({
      id: "cat-new-3",
      name: "Optical Neuro-Imaging",
      slug: "optical-neuro-imaging",
      description: "Near-infrared spectroscopy sensors",
      is_active: true,
    });

    render(<AdminCategoriesPage />);

    fireEvent.click(screen.getByRole("button", { name: /add category/i }));

    expect(screen.getByText("Create New Category")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Audio & Sound/i), {
      target: { value: "Optical Neuro-Imaging" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. audio-sound/i), {
      target: { value: "optical-neuro-imaging" },
    });
    fireEvent.change(screen.getByPlaceholderText(/brief category description/i), {
      target: { value: "Near-infrared spectroscopy sensors" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^create category$/i }));

    await waitFor(() => {
      expect(catalogService.createCategory).toHaveBeenCalledWith({
        name: "Optical Neuro-Imaging",
        slug: "optical-neuro-imaging",
        description: "Near-infrared spectroscopy sensors",
        is_active: true,
      });
    });
  });

  it("6. Empty State: renders taxonomy empty state when no categories exist", () => {
    vi.mocked(useCategories).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminCategoriesPage />);

    expect(screen.getByText("No Categories Found")).toBeInTheDocument();
    expect(screen.getByText("Create Category")).toBeInTheDocument();
  });
});
