import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminBrandsPage from "@/app/(admin)/admin/brands/page";
import * as brandHooks from "@/hooks/use-brands";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/brands",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockBrands = [
  {
    id: "br-1",
    name: "NeuroCore Dynamics",
    slug: "neurocore-dynamics",
    website_url: "https://neurocore.ai",
    description: "High-density neural recording arrays",
    is_active: true,
    sort_order: 1,
    products_count: 28,
  },
  {
    id: "br-2",
    name: "Synapse Labs",
    slug: "synapse-labs",
    website_url: "https://synapselabs.tech",
    description: "Wireless telemetry transmitters",
    is_active: false,
    sort_order: 2,
    products_count: 12,
  },
];

describe("Admin Brands & Manufacturer Management Suite (STEP 27.4)", () => {
  const mockCreateMutate = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(brandHooks, "useBrands").mockReturnValue({
      data: mockBrands,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.spyOn(brandHooks, "useCreateBrand").mockReturnValue({
      mutateAsync: mockCreateMutate,
      isPending: false,
    } as any);

    vi.spyOn(brandHooks, "useUpdateBrand").mockReturnValue({
      mutateAsync: mockUpdateMutate,
      isPending: false,
    } as any);

    vi.spyOn(brandHooks, "useDeleteBrand").mockReturnValue({
      mutateAsync: mockDeleteMutate,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, breadcrumb navigation, and Add Brand CTA", () => {
    render(<AdminBrandsPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("BRAND REGISTRY")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Brands", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add brand/i })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative total brands, active count, and assigned products", () => {
    render(<AdminBrandsPage />);

    expect(screen.getByText("Total Brands")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Active Manufacturers")).toBeInTheDocument();
    expect(screen.getByText("1 Active")).toBeInTheDocument();
    expect(screen.getByText("Assigned Products")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search query and filters brands", () => {
    render(<AdminBrandsPage />);

    const searchInput = screen.getByPlaceholderText(/search brands/i);
    fireEvent.change(searchInput, { target: { value: "NeuroCore" } });
    expect(searchInput).toHaveValue("NeuroCore");

    expect(screen.getByText("NeuroCore Dynamics")).toBeInTheDocument();
    expect(screen.queryByText("Synapse Labs")).not.toBeInTheDocument();
  });

  it("4. Brands Table: renders brand rows with initials avatar, name, slug, website, and status", () => {
    render(<AdminBrandsPage />);

    expect(screen.getByText("ND")).toBeInTheDocument();
    expect(screen.getByText("NeuroCore Dynamics")).toBeInTheDocument();
    expect(screen.getByText("neurocore-dynamics")).toBeInTheDocument();
    expect(screen.getByText("https://neurocore.ai")).toBeInTheDocument();
    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();

    expect(screen.getByText("SL")).toBeInTheDocument();
    expect(screen.getByText("Synapse Labs")).toBeInTheDocument();
    expect(screen.getByText("synapse-labs")).toBeInTheDocument();
    expect(screen.getByText("https://synapselabs.tech")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Disabled")).toBeInTheDocument();
  });

  it("5. Creation Dialog Flow: opens modal and submits new brand payload", async () => {
    mockCreateMutate.mockResolvedValueOnce({
      id: "br-new-3",
      name: "Cortex Optica",
      slug: "cortex-optica",
      website_url: "https://cortexoptica.com",
      description: "Optogenetic laser emitters",
      is_active: true,
    });

    render(<AdminBrandsPage />);

    fireEvent.click(screen.getByRole("button", { name: /add brand/i }));

    expect(screen.getByText("Create New Brand")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/brand name \*/i), {
      target: { value: "Cortex Optica" },
    });
    fireEvent.change(screen.getByLabelText(/url slug/i), {
      target: { value: "cortex-optica" },
    });
    fireEvent.change(screen.getByLabelText(/official website/i), {
      target: { value: "https://cortexoptica.com" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Optogenetic laser emitters" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^create brand$/i }));

    await waitFor(() => {
      expect(mockCreateMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Cortex Optica",
          slug: "cortex-optica",
          website_url: "https://cortexoptica.com",
          description: "Optogenetic laser emitters",
          is_active: true,
        })
      );
    });
  });

  it("6. Empty State: renders brand empty state when no brands exist", () => {
    vi.spyOn(brandHooks, "useBrands").mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminBrandsPage />);

    expect(screen.getByText("No Brands Found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Brand" })).toBeInTheDocument();
  });
});
