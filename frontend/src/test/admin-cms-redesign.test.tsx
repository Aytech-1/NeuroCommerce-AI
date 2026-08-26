import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AdminCmsPagesPage from "@/app/(admin)/admin/cms/pages/page";
import CreateCmsPage from "@/app/(admin)/admin/cms/pages/create/page";
import EditCmsPage from "@/app/(admin)/admin/cms/pages/[id]/edit/page";
import CmsPageDetailPage from "@/app/(admin)/admin/cms/pages/[id]/page";
import { useCmsPages, useCmsPage, useTogglePublishPage, useDeleteCmsPage } from "@/hooks/use-cms";
import { cmsService, CmsPageItem } from "@/services/cms-service";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/cms/pages",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/services/cms-service", () => ({
  cmsService: {
    createPage: vi.fn(),
    updatePage: vi.fn(),
  },
}));

vi.mock("@/hooks/use-cms", () => ({
  useCmsPages: vi.fn(),
  useCmsPage: vi.fn(),
  useTogglePublishPage: vi.fn(),
  useDeleteCmsPage: vi.fn(),
}));

const mockPage: CmsPageItem = {
  id: "page-1",
  title: "Clinical Research Ethics & Compliance",
  slug: "clinical-ethics-compliance",
  content: "NeuroCommerce complies with all institutional IRB standards.",
  excerpt: "Official policy on ethical neural data processing.",
  template: "default",
  status: "published",
  author: { id: "u-1", name: "Dr. Gregory House", email: "house@princeton.edu" },
  meta_title: "Ethics Policy | NeuroCommerce",
  meta_description: "IRB guidelines and privacy rules.",
  published_at: "2026-08-01T00:00:00Z",
  created_at: "2026-08-01T00:00:00Z",
  updated_at: "2026-08-01T00:00:00Z",
};

describe("Admin CMS & Content Operations Suite (STEP 27.9)", () => {
  const mockToggle = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCmsPages).mockReturnValue({
      data: {
        data: [mockPage],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useCmsPage).mockReturnValue({
      data: mockPage,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useTogglePublishPage).mockReturnValue({
      mutateAsync: mockToggle,
      isPending: false,
    } as any);

    vi.mocked(useDeleteCmsPage).mockReturnValue({
      mutateAsync: mockDelete,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and Create Page CTA", () => {
    render(<AdminCmsPagesPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("CONTENT MANAGEMENT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Content Management", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create page/i })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative CMS telemetry", () => {
    render(<AdminCmsPagesPage />);

    expect(screen.getByText("Total Pages")).toBeInTheDocument();
    expect(screen.getByText("1 Pages")).toBeInTheDocument();
    expect(screen.getByText("Published & Live")).toBeInTheDocument();
    expect(screen.getByText("1 Published")).toBeInTheDocument();
    expect(screen.getByText("Draft Documents")).toBeInTheDocument();
    expect(screen.getByText("0 Drafts")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search input and renders select options", () => {
    render(<AdminCmsPagesPage />);

    const searchInput = screen.getByPlaceholderText(/search by title or slug/i);
    fireEvent.change(searchInput, { target: { value: "Ethics" } });
    expect(searchInput).toHaveValue("Ethics");

    expect(screen.getByText("All Statuses")).toBeInTheDocument();
  });

  it("4. CMS Table: renders title, slug, status, author, and actions", () => {
    render(<AdminCmsPagesPage />);

    expect(screen.getByText("Clinical Research Ethics & Compliance")).toBeInTheDocument();
    expect(screen.getByText("/clinical-ethics-compliance")).toBeInTheDocument();
    expect(screen.getByText("Dr. Gregory House")).toBeInTheDocument();
    expect(screen.getAllByText("Published").length).toBeGreaterThanOrEqual(1);
  });

  it("5. Toggle Publish & Delete Actions: triggers toggle mutation", () => {
    render(<AdminCmsPagesPage />);

    fireEvent.click(screen.getByRole("button", { name: /unpublish/i }));
    expect(mockToggle).toHaveBeenCalledWith("page-1");
  });

  it("6. Create CMS Page: validates required fields and submits form", async () => {
    vi.mocked(cmsService.createPage).mockResolvedValueOnce({
      ...mockPage,
      id: "page-new-1",
      title: "Privacy Statement",
    });

    render(<CreateCmsPage />);

    expect(screen.getByText("CONTENT OPERATIONS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create CMS Page", level: 1 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /save page/i }));

    await waitFor(() => {
      expect(screen.getByText(/page title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/page content is required/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/page title \*/i), { target: { value: "Privacy Statement" } });
    fireEvent.change(screen.getByLabelText(/body content \*/i), { target: { value: "We protect all user data." } });

    fireEvent.click(screen.getByRole("button", { name: /save page/i }));

    await waitFor(() => {
      expect(cmsService.createPage).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/admin/cms/pages/page-new-1");
    });
  });

  it("7. Page Detail View: renders body content, author, and SEO metadata", async () => {
    await act(async () => {
      render(<CmsPageDetailPage params={Promise.resolve({ id: "page-1" })} />);
    });

    expect(screen.getByText("DOCUMENT INSPECTION")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Clinical Research Ethics & Compliance", level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/NeuroCommerce complies with all institutional IRB standards/i)).toBeInTheDocument();
    expect(screen.getByText("Ethics Policy | NeuroCommerce")).toBeInTheDocument();
  });

  it("8. Edit CMS Page: preloads values and submits update", async () => {
    vi.mocked(cmsService.updatePage).mockResolvedValueOnce({
      ...mockPage,
    });

    await act(async () => {
      render(<EditCmsPage params={Promise.resolve({ id: "page-1" })} />);
    });

    expect(screen.getByText("CONTENT EDITOR")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /edit page: clinical research ethics & compliance/i, level: 1 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(cmsService.updatePage).toHaveBeenCalled();
    });
  });

  it("9. Empty State: renders empty notice when 0 pages exist", () => {
    vi.mocked(useCmsPages).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 15, total: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminCmsPagesPage />);

    expect(screen.getByText("No CMS Pages Created")).toBeInTheDocument();
  });
});
