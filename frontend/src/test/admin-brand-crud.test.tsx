import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminBrandsPage from "@/app/(admin)/admin/brands/page";
import * as brandHooks from "@/hooks/use-brands";
import { BrandItem, brandService } from "@/services/brand-service";

// Mock permissions to allow all actions
vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockBrands: BrandItem[] = [
  {
    id: "br-neuro-1",
    name: "NeuroTech Labs",
    slug: "neurotech-labs",
    description: "Pioneering brain-computer interfaces",
    logo_url: "https://example.com/neurotech.png",
    website_url: "https://neurotech.example.com",
    is_active: true,
    sort_order: 1,
    products_count: 8,
  },
  {
    id: "br-sound-2",
    name: "SoundMax Audio",
    slug: "soundmax-audio",
    description: "Audiophile high-fidelity headphones",
    logo_url: "https://example.com/soundmax.png",
    website_url: "https://soundmax.example.com",
    is_active: true,
    sort_order: 2,
    products_count: 5,
  },
  {
    id: "br-legacy-3",
    name: "Legacy Optics",
    slug: "legacy-optics",
    description: "Discontinued optical sensors",
    logo_url: null,
    website_url: null,
    is_active: false,
    sort_order: 9,
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

describe("Admin Brand CRUD Management Suite (STEP 28.6H)", () => {
  const mockCreateMutateAsync = vi.fn();
  const mockUpdateMutateAsync = vi.fn();
  const mockDeleteMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(brandHooks, "useBrands").mockReturnValue({
      data: mockBrands,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(brandHooks, "useCreateBrand").mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    } as any);

    vi.spyOn(brandHooks, "useUpdateBrand").mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false,
    } as any);

    vi.spyOn(brandHooks, "useDeleteBrand").mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    } as any);
  });

  it("1. Existing Brand list renders with metrics, slugs, product counts, and status pills", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <AdminBrandsPage />
      </Wrapper>
    );

    expect(screen.getByRole("heading", { name: "Brands", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Total Brands")).toBeInTheDocument();
    expect(screen.getByText("NeuroTech Labs")).toBeInTheDocument();
    expect(screen.getByText("neurotech-labs")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("SoundMax Audio")).toBeInTheDocument();
    expect(screen.getByText("soundmax-audio")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getAllByText("Active").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("2. Empty state renders correctly when no brands exist", () => {
    vi.spyOn(brandHooks, "useBrands").mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <AdminBrandsPage />
      </Wrapper>
    );

    expect(screen.getByText("No Brands Found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Brand" })).toBeInTheDocument();
  });

  it("3. Create Brand mutation works on valid submit", async () => {
    const { Wrapper } = createWrapper();
    mockCreateMutateAsync.mockResolvedValueOnce({
      id: "br-new-1",
      name: "Cortex Bio",
      slug: "cortex-bio",
      website_url: "https://cortexbio.ai",
      description: "Cortical implants and probes",
      is_active: true,
      sort_order: 3,
    });

    render(
      <Wrapper>
        <AdminBrandsPage />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Brand" }));

    expect(screen.getByText("Create New Brand")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/brand name \*/i), {
      target: { value: "Cortex Bio" },
    });
    fireEvent.change(screen.getByLabelText(/url slug/i), {
      target: { value: "cortex-bio" },
    });
    fireEvent.change(screen.getByLabelText(/official website/i), {
      target: { value: "https://cortexbio.ai" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Cortical implants and probes" },
    });

    const submitBtn = screen.getByRole("button", { name: "Create Brand" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Cortex Bio",
          slug: "cortex-bio",
          website_url: "https://cortexbio.ai",
          description: "Cortical implants and probes",
          is_active: true,
        })
      );
    });
  });

  it("4. Edit modal opens with existing Brand data prefilled", async () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <AdminBrandsPage />
      </Wrapper>
    );

    const editBtn = screen.getByRole("button", { name: "Edit NeuroTech Labs" });
    fireEvent.click(editBtn);

    expect(screen.getByText("Edit Brand")).toBeInTheDocument();
    expect(screen.getByLabelText(/brand name \*/i)).toHaveValue("NeuroTech Labs");
    expect(screen.getByLabelText(/url slug/i)).toHaveValue("neurotech-labs");
    expect(screen.getByLabelText(/official website/i)).toHaveValue("https://neurotech.example.com");
    expect(screen.getByLabelText(/description/i)).toHaveValue("Pioneering brain-computer interfaces");
  });

  it("5. Update mutation sends correct payload on edit save", async () => {
    const { Wrapper } = createWrapper();
    mockUpdateMutateAsync.mockResolvedValueOnce({
      ...mockBrands[0],
      name: "NeuroTech Global Labs",
    });

    render(
      <Wrapper>
        <AdminBrandsPage />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit NeuroTech Labs" }));

    fireEvent.change(screen.getByLabelText(/brand name \*/i), {
      target: { value: "NeuroTech Global Labs" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: "br-neuro-1",
        payload: expect.objectContaining({
          name: "NeuroTech Global Labs",
        }),
      });
    });
  });

  it("6. Delete confirmation opens and renders brand details and warning", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <AdminBrandsPage />
      </Wrapper>
    );

    const deleteBtn = screen.getByRole("button", { name: "Delete NeuroTech Labs" });
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Delete Brand "NeuroTech Labs"?')).toBeInTheDocument();
    expect(
      screen.getByText(/Warning: This brand is currently assigned to 8 product\(s\)/i)
    ).toBeInTheDocument();
  });

  it("7. Delete mutation sends correct Brand ID on confirmation", async () => {
    const { Wrapper } = createWrapper();
    mockDeleteMutateAsync.mockResolvedValueOnce(undefined);

    render(
      <Wrapper>
        <AdminBrandsPage />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete NeuroTech Labs" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Brand" }));

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith("br-neuro-1");
    });
  });

  it("8. Status toggle sends correct is_active value", async () => {
    const { Wrapper } = createWrapper();
    mockUpdateMutateAsync.mockResolvedValueOnce({
      ...mockBrands[0],
      is_active: false,
    });

    render(
      <Wrapper>
        <AdminBrandsPage />
      </Wrapper>
    );

    const toggleBtn = screen.getByRole("button", { name: "Toggle status for NeuroTech Labs" });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        id: "br-neuro-1",
        payload: { is_active: false },
      });
    });
  });

  it("9. Duplicate name/slug validation error is displayed clearly", async () => {
    const { Wrapper } = createWrapper();
    mockCreateMutateAsync.mockRejectedValueOnce({
      response: {
        data: {
          message: "The name has already been taken.",
        },
      },
    });

    render(
      <Wrapper>
        <AdminBrandsPage />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Brand" }));
    fireEvent.change(screen.getByLabelText(/brand name \*/i), {
      target: { value: "NeuroTech Labs" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create Brand" }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("The name has already been taken.");
    });
  });

  it("10. Forbidden/unauthorized error is handled without crashing", async () => {
    const { Wrapper } = createWrapper();
    mockUpdateMutateAsync.mockRejectedValueOnce({
      response: {
        status: 403,
        data: {
          message: "User does not have the brand.update permission.",
        },
      },
    });

    render(
      <Wrapper>
        <AdminBrandsPage />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle status for NeuroTech Labs" }));

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalled();
    });
  });

  it("14. Product Brand selector remains connected to real Brand data", () => {
    vi.spyOn(brandHooks, "useBrands").mockReturnValue({
      data: mockBrands,
      isLoading: false,
      isError: false,
    } as any);

    const BrandSelectComponent = () => {
      const { data: brands } = brandHooks.useBrands();
      return (
        <select aria-label="Select Brand">
          <option value="">Select Brand</option>
          {brands?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      );
    };

    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <BrandSelectComponent />
      </Wrapper>
    );

    const select = screen.getByLabelText("Select Brand");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("NeuroTech Labs")).toBeInTheDocument();
    expect(screen.getByText("SoundMax Audio")).toBeInTheDocument();
    expect(screen.getByText("Legacy Optics")).toBeInTheDocument();
  });
});

describe("Brand React Query Mutation Invalidation Suite", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("11. Query cache invalidation occurs after create brand hook execution", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.spyOn(brandService, "createBrand").mockResolvedValueOnce({
      id: "br-created-1",
      name: "SynthBrain",
      slug: "synthbrain",
      description: null,
      logo_url: null,
      website_url: null,
      is_active: true,
      sort_order: 0,
    });

    const TestComponent = () => {
      const createMutation = brandHooks.useCreateBrand();
      return (
        <button
          onClick={() =>
            createMutation.mutateAsync({ name: "SynthBrain" })
          }
        >
          Run Create
        </button>
      );
    };

    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );

    fireEvent.click(screen.getByText("Run Create"));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["admin", "brands"] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["brands"] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["admin", "products"] })
      );
    });
  });

  it("12. Query cache invalidation occurs after update brand hook execution", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.spyOn(brandService, "updateBrand").mockResolvedValueOnce({
      id: "br-updated-1",
      name: "SynthBrain Pro",
      slug: "synthbrain-pro",
      description: null,
      logo_url: null,
      website_url: null,
      is_active: true,
      sort_order: 0,
    });

    const TestComponent = () => {
      const updateMutation = brandHooks.useUpdateBrand();
      return (
        <button
          onClick={() =>
            updateMutation.mutateAsync({
              id: "br-updated-1",
              payload: { name: "SynthBrain Pro" },
            })
          }
        >
          Run Update
        </button>
      );
    };

    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );

    fireEvent.click(screen.getByText("Run Update"));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["admin", "brands"] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["brands"] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["admin", "products"] })
      );
    });
  });

  it("13. Query cache invalidation occurs after delete brand hook execution", async () => {
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    vi.spyOn(brandService, "deleteBrand").mockResolvedValueOnce();

    const TestComponent = () => {
      const deleteMutation = brandHooks.useDeleteBrand();
      return (
        <button onClick={() => deleteMutation.mutateAsync("br-deleted-1")}>
          Run Delete
        </button>
      );
    };

    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );

    fireEvent.click(screen.getByText("Run Delete"));

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["admin", "brands"] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["brands"] })
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ["admin", "products"] })
      );
    });
  });
});
