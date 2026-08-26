import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminMediaPage from "@/app/(admin)/admin/media/page";
import { useMedia, useUploadMedia, useDeleteMedia } from "@/hooks/use-media";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/media",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/use-media", () => ({
  useMedia: vi.fn(),
  useUploadMedia: vi.fn(),
  useDeleteMedia: vi.fn(),
}));

const mockMediaItem = {
  id: "media-1",
  name: "headset-hero",
  file_name: "neural-headset-hero.png",
  mime_type: "image/png",
  size: 204800,
  url: "https://example.com/media/neural-headset-hero.png",
  collection: "products",
  alt_text: "High-resolution neural EEG headset",
  created_at: "2026-08-20T00:00:00Z",
};

describe("Admin Media Library & Asset Operations Suite (STEP 27.10)", () => {
  const mockUpload = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    vi.mocked(useMedia).mockReturnValue({
      data: {
        data: [mockMediaItem],
        meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useUploadMedia).mockReturnValue({
      mutateAsync: mockUpload,
      isPending: false,
    } as any);

    vi.mocked(useDeleteMedia).mockReturnValue({
      mutateAsync: mockDelete,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and Upload File CTA", () => {
    render(<AdminMediaPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("MEDIA LIBRARY")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Media Library", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload file/i })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative media asset telemetry", () => {
    render(<AdminMediaPage />);

    expect(screen.getByText("Total Assets")).toBeInTheDocument();
    expect(screen.getByText("1 Assets")).toBeInTheDocument();
    expect(screen.getByText("Image Files")).toBeInTheDocument();
    expect(screen.getByText("1 Images")).toBeInTheDocument();
    expect(screen.getByText("Documents & PDFs")).toBeInTheDocument();
    expect(screen.getByText("0 Files")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search input and renders collection options", () => {
    render(<AdminMediaPage />);

    const searchInput = screen.getByPlaceholderText(/search by filename or title/i);
    fireEvent.change(searchInput, { target: { value: "headset" } });
    expect(searchInput).toHaveValue("headset");

    expect(screen.getByText("All Collections")).toBeInTheDocument();
  });

  it("4. Media Grid View: renders asset card with filename and collection badge", () => {
    render(<AdminMediaPage />);

    expect(screen.getByText("neural-headset-hero.png")).toBeInTheDocument();
    expect(screen.getByText("products")).toBeInTheDocument();
  });

  it("5. View Switcher: switches to list view and renders table", () => {
    render(<AdminMediaPage />);

    fireEvent.click(screen.getByLabelText("List view"));

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("image/png")).toBeInTheDocument();
  });

  it("6. Inspection Modal: opens asset details on card click", () => {
    render(<AdminMediaPage />);

    fireEvent.click(screen.getByText("neural-headset-hero.png"));

    expect(screen.getByText("ID: media-1")).toBeInTheDocument();
    expect(screen.getByText("High-resolution neural EEG headset")).toBeInTheDocument();
  });

  it("7. Upload Modal: opens upload dialog and triggers upload mutation", async () => {
    render(<AdminMediaPage />);

    fireEvent.click(screen.getByRole("button", { name: /upload file/i }));

    expect(screen.getByText("Upload Media Asset")).toBeInTheDocument();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["dummy content"], "test-asset.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const form = fileInput.closest("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled();
    });
  });

  it("8. Empty State: renders empty notice when 0 assets exist", () => {
    vi.mocked(useMedia).mockReturnValue({
      data: { data: [], meta: { current_page: 1, per_page: 20, total: 0 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminMediaPage />);

    expect(screen.getByText("No Media Assets Found")).toBeInTheDocument();
  });
});
