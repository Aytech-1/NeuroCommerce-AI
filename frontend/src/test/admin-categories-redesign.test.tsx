import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminCategoriesPage from "@/app/(admin)/admin/categories/page";
import * as catalogHooks from "@/hooks/use-catalog";
import * as categoryHooks from "@/hooks/use-categories";
import { categoryService } from "@/services/category-service";

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

vi.mock("@/services/category-service", () => ({
  categoryService: {
    getCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
  },
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
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(categoryHooks, "useCategories").mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(categoryHooks, "useCreateCategory").mockReturnValue({
      mutateAsync: mockCreateMutate,
      isPending: false,
    } as any);

    vi.spyOn(categoryHooks, "useUpdateCategory").mockReturnValue({
      mutateAsync: mockUpdateMutate,
      isPending: false,
    } as any);

    vi.spyOn(categoryHooks, "useDeleteCategory").mockReturnValue({
      mutateAsync: mockDeleteMutate,
      isPending: false,
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
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Active Taxonomies")).toBeInTheDocument();
    expect(screen.getByText("1 Active")).toBeInTheDocument();
    expect(screen.getByText("Assigned Products")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
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
    mockCreateMutate.mockResolvedValueOnce({
      id: "cat-new-3",
      name: "Optical Neuro-Imaging",
      slug: "optical-neuro-imaging",
      description: "Near-infrared spectroscopy sensors",
      is_active: true,
    });

    render(<AdminCategoriesPage />);

    fireEvent.click(screen.getByRole("button", { name: /add category/i }));

    expect(screen.getByText("Create New Category")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/category name \*/i), {
      target: { value: "Optical Neuro-Imaging" },
    });
    fireEvent.change(screen.getByLabelText(/url slug/i), {
      target: { value: "optical-neuro-imaging" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Near-infrared spectroscopy sensors" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^create category$/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Optical Neuro-Imaging",
          slug: "optical-neuro-imaging",
          description: "Near-infrared spectroscopy sensors",
          is_active: true,
        })
      );
    });
  });

  it("6. Empty State: renders taxonomy empty state when no categories exist", () => {
    vi.spyOn(categoryHooks, "useCategories").mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminCategoriesPage />);

    expect(screen.getByText("No Categories Found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Category" })).toBeInTheDocument();
  });
});
