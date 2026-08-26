import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminCmsPagesPage from "@/app/(admin)/admin/cms/pages/page";
import CreateCmsPage from "@/app/(admin)/admin/cms/pages/create/page";
import { useCmsPages, useTogglePublishPage, useDeleteCmsPage } from "@/hooks/use-cms";
import { cmsService, CmsPageItem } from "@/services/cms-service";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/services/cms-service", () => ({
  cmsService: {
    createPage: vi.fn(),
  },
}));

vi.mock("@/hooks/use-cms", () => ({
  useCmsPages: vi.fn(),
  useTogglePublishPage: vi.fn(),
  useDeleteCmsPage: vi.fn(),
}));

const mockPage: CmsPageItem = {
  id: "page-1",
  title: "Privacy & Neural Data Policy",
  slug: "privacy-policy",
  content: "# Privacy Policy\n\nWe encrypt neural telemetry in transit.",
  excerpt: "Official privacy guarantees regarding BCI brainwave telemetry.",
  template: "legal",
  status: "published",
  author: {
    id: "admin-1",
    name: "System Admin",
    email: "admin@neurocommerce.ai",
  },
  published_at: "2026-08-20T00:00:00Z",
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

describe("Admin CMS Pages Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTogglePublishPage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useDeleteCmsPage).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("renders CMS page list table with title and published status", () => {
    vi.mocked(useCmsPages).mockReturnValue({
      data: {
        data: [mockPage],
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminCmsPagesPage />);

    expect(screen.getByText("Privacy & Neural Data Policy")).toBeInTheDocument();
    expect(screen.getByText("/privacy-policy")).toBeInTheDocument();
    expect(screen.getByText("published")).toBeInTheDocument();
    expect(screen.getByText("System Admin")).toBeInTheDocument();
  });

  it("validates required fields on CMS page creation submit", async () => {
    render(<CreateCmsPage />);

    fireEvent.click(screen.getByRole("button", { name: /save page/i }));

    await waitFor(() => {
      expect(screen.getByText(/page title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/page content is required/i)).toBeInTheDocument();
    });
  });

  it("submits valid CMS page payload and redirects to detail", async () => {
    vi.mocked(cmsService.createPage).mockResolvedValueOnce({
      ...mockPage,
      id: "page-new-99",
      title: "Terms of Service",
    });

    render(<CreateCmsPage />);

    fireEvent.change(screen.getByLabelText(/page title \*/i), { target: { value: "Terms of Service" } });
    fireEvent.change(screen.getByLabelText(/url slug \*/i), { target: { value: "terms-of-service" } });
    fireEvent.change(screen.getByLabelText(/body content \*/i), { target: { value: "Terms and conditions..." } });

    fireEvent.click(screen.getByRole("button", { name: /save page/i }));

    await waitFor(() => {
      expect(cmsService.createPage).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/admin/cms/pages/page-new-99");
    });
  });
});
