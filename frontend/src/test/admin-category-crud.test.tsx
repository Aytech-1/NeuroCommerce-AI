import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminCategoriesPage from "@/app/(admin)/admin/categories/page";
import * as categoryHooks from "@/hooks/use-categories";
import { CategoryItem } from "@/services/category-service";

// Mock permissions to allow all actions
vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockCategories: CategoryItem[] = [
  {
    id: "cat-wearables-1",
    name: "Neural Interfaces",
    slug: "neural-interfaces",
    description: "Direct brain-computer hardware and telemetry",
    parent_id: null,
    sort_order: 1,
    is_active: true,
    products_count: 12,
  },
  {
    id: "cat-sub-1",
    name: "EEG Headsets",
    slug: "eeg-headsets",
    description: "Non-invasive brainwave sensing headsets",
    parent_id: "cat-wearables-1",
    sort_order: 2,
    is_active: true,
    products_count: 5,
  },
  {
    id: "cat-legacy-1",
    name: "Legacy Sensors",
    slug: "legacy-sensors",
    description: "Discontinued diagnostic hardware",
    parent_id: null,
    sort_order: 9,
    is_active: false,
    products_count: 0,
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return {
    queryClient,
    Wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

describe("Admin Category CRUD Management Suite (STEP 28.6F)", () => {
  const mockCreateMutateAsync = vi.fn();
  const mockUpdateMutateAsync = vi.fn();
  const mockDeleteMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(categoryHooks, "useCategories").mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(categoryHooks, "useCreateCategory").mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    } as any);

    vi.spyOn(categoryHooks, "useUpdateCategory").mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false,
    } as any);

    vi.spyOn(categoryHooks, "useDeleteCategory").mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    } as any);
  });

  it("1. renders categories table with taxonomy metrics, slugs, product counts, and status pills", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <AdminCategoriesPage />
      </Wrapper>
    );

    expect(screen.getByRole("heading", { name: "Categories", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Total Categories")).toBeInTheDocument();
    expect(screen.getAllByText("Neural Interfaces").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("neural-interfaces")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    // Check Subcategory hierarchy indicator
    expect(screen.getByText("EEG Headsets")).toBeInTheDocument();
    expect(screen.getByText("Subcategory of:")).toBeInTheDocument();

    // Status badges
    expect(screen.getAllByText("Active").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("2. renders clean empty state when no categories exist", () => {
    vi.spyOn(categoryHooks, "useCategories").mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <AdminCategoriesPage />
      </Wrapper>
    );

    expect(screen.getByText("No Categories Found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Category" })).toBeInTheDocument();
  });

  it("3. opens create modal and dispatches category creation mutation on valid submission", async () => {
    const { Wrapper } = createWrapper();
    mockCreateMutateAsync.mockResolvedValueOnce({
      id: "cat-new-1",
      name: "Bio-Telemetry",
      slug: "bio-telemetry",
      is_active: true,
    });

    render(
      <Wrapper>
        <AdminCategoriesPage />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Category" }));

    expect(screen.getByText("Create New Category")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/category name \*/i), {
      target: { value: "Bio-Telemetry" },
    });
    fireEvent.change(screen.getByLabelText(/url slug/i), {
      target: { value: "bio-telemetry" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Biometric telemetry devices" },
    });

    const submitBtn = screen.getByRole("button", { name: "Create Category" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Bio-Telemetry",
          slug: "bio-telemetry",
          description: "Biometric telemetry devices",
          is_active: true,
        })
      );
    });
  });

  it("4. opens edit modal prefilled with existing category data and dispatches update mutation", async () => {
    const { Wrapper } = createWrapper();
    mockUpdateMutateAsync.mockResolvedValueOnce({
      ...mockCategories[0],
      name: "Neural Interfaces & BCI",
    });

    render(
      <Wrapper>
        <AdminCategoriesPage />
      </Wrapper>
    );

    const editBtn = screen.getByRole("button", { name: "Edit Neural Interfaces" });
    fireEvent.click(editBtn);

    expect(screen.getByText("Edit Category")).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/category name \*/i);
    expect(nameInput).toHaveValue("Neural Interfaces");

    fireEvent.change(nameInput, {
      target: { value: "Neural Interfaces & BCI" },
    });

    const saveBtn = screen.getByRole("button", { name: "Save Changes" });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: "cat-wearables-1",
        payload: expect.objectContaining({
          name: "Neural Interfaces & BCI",
        }),
      });
    });
  });

  it("5. triggers status toggle mutation directly from action row", async () => {
    const { Wrapper } = createWrapper();
    mockUpdateMutateAsync.mockResolvedValueOnce({
      ...mockCategories[0],
      is_active: false,
    });

    render(
      <Wrapper>
        <AdminCategoriesPage />
      </Wrapper>
    );

    const toggleBtn = screen.getByRole("button", { name: "Toggle status for Neural Interfaces" });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: "cat-wearables-1",
        payload: { is_active: false },
      });
    });
  });

  it("6. opens delete confirmation dialog and triggers delete mutation on confirmation", async () => {
    const { Wrapper } = createWrapper();
    mockDeleteMutateAsync.mockResolvedValueOnce(undefined);

    render(
      <Wrapper>
        <AdminCategoriesPage />
      </Wrapper>
    );

    const deleteBtn = screen.getByRole("button", { name: "Delete Neural Interfaces" });
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Delete Category "Neural Interfaces"?')).toBeInTheDocument();
    expect(screen.getByText(/Warning: This category currently has 12 assigned product\(s\)/i)).toBeInTheDocument();

    const confirmBtn = screen.getByRole("button", { name: "Delete Category" });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith("cat-wearables-1");
    });
  });

  it("7. handles backend validation error and displays alert message in modal", async () => {
    const { Wrapper } = createWrapper();
    mockCreateMutateAsync.mockRejectedValueOnce({
      message: "The slug has already been taken.",
    });

    render(
      <Wrapper>
        <AdminCategoriesPage />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Category" }));

    fireEvent.change(screen.getByLabelText(/category name \*/i), {
      target: { value: "Neural Interfaces" },
    });

    const submitBtn = screen.getByRole("button", { name: "Create Category" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("The slug has already been taken.");
    });
  });

  it("8. filters category list by search keyword and status", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <AdminCategoriesPage />
      </Wrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search categories/i);
    fireEvent.change(searchInput, { target: { value: "EEG" } });

    expect(screen.getByText("EEG Headsets")).toBeInTheDocument();
    expect(screen.queryByText("Legacy Sensors")).not.toBeInTheDocument();

    // Filter by disabled status
    fireEvent.change(searchInput, { target: { value: "" } });
    const statusSelect = screen.getByLabelText("Filter by category status");
    fireEvent.change(statusSelect, { target: { value: "disabled" } });

    expect(screen.getByText("Legacy Sensors")).toBeInTheDocument();
    expect(screen.queryByText("Neural Interfaces")).not.toBeInTheDocument();
  });
});
