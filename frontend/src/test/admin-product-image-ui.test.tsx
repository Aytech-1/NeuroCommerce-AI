import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { ProductImage } from "@/services/catalog-service";
import * as useCatalogModule from "@/hooks/use-catalog";

// Mock toast notifications
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, Wrapper };
}

describe("Admin Product Image Management UI (ProductImageManager)", () => {
  const mockProductId = "prod-uuid-999";
  const mockImages: ProductImage[] = [
    {
      id: "img-1",
      url: "http://localhost:8000/storage/products/p1/front.jpg",
      alt_text: "Front view",
      is_primary: true,
      sort_order: 0,
    },
    {
      id: "img-2",
      url: "http://localhost:8000/storage/products/p1/back.jpg",
      alt_text: "Back view",
      is_primary: false,
      sort_order: 1,
    },
  ];

  const mockUploadMutateAsync = vi.fn();
  const mockDeleteMutateAsync = vi.fn();
  const mockReorderMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useCatalogModule, "useUploadProductImages").mockReturnValue({
      mutateAsync: mockUploadMutateAsync,
      isPending: false,
    } as any);

    vi.spyOn(useCatalogModule, "useDeleteProductImage").mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    } as any);

    vi.spyOn(useCatalogModule, "useReorderProductImages").mockReturnValue({
      mutateAsync: mockReorderMutateAsync,
      isPending: false,
    } as any);

    // Mock URL.createObjectURL and URL.revokeObjectURL for browser preview
    global.URL.createObjectURL = vi.fn(() => "blob:http://localhost:3000/mock-preview-url");
    global.URL.revokeObjectURL = vi.fn();
  });

  it("1. renders empty state when no images are uploaded or pending", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <ProductImageManager productId={mockProductId} existingImages={[]} />
      </Wrapper>
    );

    expect(screen.getByText("Product Media & Gallery")).toBeInTheDocument();
    expect(screen.getByText("Upload Product Images")).toBeInTheDocument();
    expect(screen.getByText("No product media attached yet.")).toBeInTheDocument();
  });

  it("2. renders uploaded gallery with primary badge and sort positions in edit mode", () => {
    const { Wrapper } = createWrapper();
    render(
      <Wrapper>
        <ProductImageManager productId={mockProductId} existingImages={mockImages} />
      </Wrapper>
    );

    expect(screen.getByText("Uploaded Gallery (2)")).toBeInTheDocument();
    expect(screen.getByText("Primary")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", mockImages[0].url);
  });

  it("3. handles file selection and triggers upload mutation in edit mode", async () => {
    const { Wrapper } = createWrapper();
    mockUploadMutateAsync.mockResolvedValueOnce([]);

    const { container } = render(
      <Wrapper>
        <ProductImageManager productId={mockProductId} existingImages={mockImages} />
      </Wrapper>
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["dummy-content"], "neural-sensor.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockUploadMutateAsync).toHaveBeenCalled();
    });
  });

  it("4. rejects oversized files exceeding 5MB limit with error feedback", async () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <ProductImageManager productId={mockProductId} existingImages={mockImages} />
      </Wrapper>
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    // Create 6MB file
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "heavy-scan.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(mockUploadMutateAsync).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("exceeds the 5MB size limit");
    });
  });

  it("5. rejects unsupported MIME file types", async () => {
    const { Wrapper } = createWrapper();
    const { container } = render(
      <Wrapper>
        <ProductImageManager productId={mockProductId} existingImages={mockImages} />
      </Wrapper>
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(["test"], "data.pdf", { type: "application/pdf" });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(mockUploadMutateAsync).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("unsupported format");
    });
  });

  it("6. opens delete confirmation dialog and triggers delete mutation on confirm", async () => {
    const { Wrapper } = createWrapper();
    mockDeleteMutateAsync.mockResolvedValueOnce(null);

    render(
      <Wrapper>
        <ProductImageManager productId={mockProductId} existingImages={mockImages} />
      </Wrapper>
    );

    const deleteButtons = screen.getAllByLabelText(/Delete image/);
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByText("Delete Product Image")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete this image\?/)
    ).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "Delete Image" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith(mockImages[0].id);
    });
  });

  it("7. handles image reordering and invokes reorder mutation", async () => {
    const { Wrapper } = createWrapper();
    mockReorderMutateAsync.mockResolvedValueOnce(null);

    render(
      <Wrapper>
        <ProductImageManager productId={mockProductId} existingImages={mockImages} />
      </Wrapper>
    );

    const moveRightButtons = screen.getAllByLabelText("Move image right");
    fireEvent.click(moveRightButtons[0]);

    await waitFor(() => {
      expect(mockReorderMutateAsync).toHaveBeenCalledWith([
        { id: "img-2", sort_order: 0 },
        { id: "img-1", sort_order: 1 },
      ]);
    });
  });

  it("8. supports pending file previews and removal in create mode", () => {
    const { Wrapper } = createWrapper();
    const handlePendingChange = vi.fn();
    const dummyFile = new File(["content"], "preview.jpg", { type: "image/jpeg" });

    render(
      <Wrapper>
        <ProductImageManager
          pendingFiles={[dummyFile]}
          onPendingFilesChange={handlePendingChange}
        />
      </Wrapper>
    );

    expect(screen.getByText("Selected for Upload (1)")).toBeInTheDocument();
    expect(screen.getByText("preview.jpg")).toBeInTheDocument();

    const removeButton = screen.getByLabelText("Remove file preview.jpg");
    fireEvent.click(removeButton);

    expect(handlePendingChange).toHaveBeenCalledWith([]);
  });
});
