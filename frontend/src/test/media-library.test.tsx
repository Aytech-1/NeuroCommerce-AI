import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AdminMediaPage from "@/app/(admin)/admin/media/page";
import { useMedia, useUploadMedia, useDeleteMedia } from "@/hooks/use-media";

vi.mock("@/hooks/use-media", () => ({
  useMedia: vi.fn(),
  useUploadMedia: vi.fn(),
  useDeleteMedia: vi.fn(),
}));

const mockMedia = [
  {
    id: "media-1",
    name: "headset-hero",
    file_name: "neural-headset-hero.png",
    mime_type: "image/png",
    size: 204800,
    url: "https://example.com/media/neural-headset-hero.png",
    collection: "products",
    created_at: "2026-08-20T00:00:00Z",
  },
];

describe("Admin Media Library Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUploadMedia).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useDeleteMedia).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);
  });

  it("renders media assets grid with filename and collection badge", () => {
    vi.mocked(useMedia).mockReturnValue({
      data: {
        data: mockMedia,
        meta: { current_page: 1, per_page: 20, total: 1, last_page: 1 },
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminMediaPage />);

    expect(screen.getByText("neural-headset-hero.png")).toBeInTheDocument();
    expect(screen.getByText("products")).toBeInTheDocument();
  });
});
