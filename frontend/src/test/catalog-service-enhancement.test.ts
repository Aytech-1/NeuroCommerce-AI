import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
  catalogService,
  ProductImage,
  ProductVariant,
  ImageReorderItem,
  CreateVariantPayload,
  UpdateVariantPayload,
} from "@/services/catalog-service";
import {
  useUploadProductImages,
  useDeleteProductImage,
  useReorderProductImages,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
  CATALOG_QUERY_KEYS,
} from "@/hooks/use-catalog";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      baseURL: "http://localhost:8000/api/v1",
      timeout: 30000,
    },
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
  return { queryClient, Wrapper };
}

describe("Catalog Service & Hooks Enhancement (Images & Variants)", () => {
  const mockProductId = "prod-uuid-101";
  const mockImageId = "img-uuid-202";
  const mockVariantId = "var-uuid-303";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("catalogService Image Methods", () => {
    it("uploadProductImages sends FormData to POST /admin/products/{id}/images with multipart header", async () => {
      const mockImages: ProductImage[] = [
        {
          id: mockImageId,
          url: "http://localhost:8000/storage/products/p1/img1.jpg",
          alt_text: "Front view",
          is_primary: true,
          sort_order: 0,
        },
      ];

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          message: "Images uploaded successfully.",
          data: mockImages,
        },
      });

      const formData = new FormData();
      formData.append("alt_text", "Front view");

      const result = await catalogService.uploadProductImages(mockProductId, formData);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/admin/products/${mockProductId}/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      expect(result).toEqual(mockImages);
    });

    it("deleteProductImage sends DELETE to /admin/products/{id}/images/{imageId}", async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true, message: "Product image deleted successfully.", data: null },
      });

      await catalogService.deleteProductImage(mockProductId, mockImageId);

      expect(apiClient.delete).toHaveBeenCalledWith(
        `/admin/products/${mockProductId}/images/${mockImageId}`
      );
    });

    it("reorderProductImages sends PUT with image sort order list to /admin/products/{id}/images/reorder", async () => {
      const orderPayload: ImageReorderItem[] = [
        { id: "img-1", sort_order: 0 },
        { id: "img-2", sort_order: 1 },
      ];

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { success: true, message: "Product images reordered successfully.", data: null },
      });

      await catalogService.reorderProductImages(mockProductId, orderPayload);

      expect(apiClient.put).toHaveBeenCalledWith(
        `/admin/products/${mockProductId}/images/reorder`,
        { images: orderPayload }
      );
    });
  });

  describe("catalogService Variant Methods", () => {
    it("createProductVariant sends POST to /admin/products/{id}/variants with variant payload", async () => {
      const variantPayload: CreateVariantPayload = {
        sku: "BCI-PRO-XL",
        name: "Extra Large Sensor",
        price: 150000,
        compare_at_price: 180000,
        is_active: true,
      };

      const mockVariant: ProductVariant = {
        id: mockVariantId,
        sku: "BCI-PRO-XL",
        price: 150000,
        compare_at_price: 180000,
        is_active: true,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: {
          success: true,
          message: "Product variant created successfully.",
          data: mockVariant,
        },
      });

      const result = await catalogService.createProductVariant(mockProductId, variantPayload);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/admin/products/${mockProductId}/variants`,
        variantPayload
      );
      expect(result).toEqual(mockVariant);
    });

    it("updateProductVariant sends PUT to /admin/products/{id}/variants/{variantId}", async () => {
      const updatePayload: UpdateVariantPayload = {
        price: 145000,
        is_active: true,
      };

      const mockUpdatedVariant: ProductVariant = {
        id: mockVariantId,
        sku: "BCI-PRO-XL",
        price: 145000,
        is_active: true,
      };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: {
          success: true,
          message: "Product variant updated successfully.",
          data: mockUpdatedVariant,
        },
      });

      const result = await catalogService.updateProductVariant(
        mockProductId,
        mockVariantId,
        updatePayload
      );

      expect(apiClient.put).toHaveBeenCalledWith(
        `/admin/products/${mockProductId}/variants/${mockVariantId}`,
        updatePayload
      );
      expect(result).toEqual(mockUpdatedVariant);
    });

    it("deleteProductVariant sends DELETE to /admin/products/{id}/variants/{variantId}", async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true, message: "Product variant deleted successfully.", data: null },
      });

      await catalogService.deleteProductVariant(mockProductId, mockVariantId);

      expect(apiClient.delete).toHaveBeenCalledWith(
        `/admin/products/${mockProductId}/variants/${mockVariantId}`
      );
    });
  });

  describe("React Query Hooks & Query Invalidation", () => {
    it("useUploadProductImages invalidates product detail and product list queries", async () => {
      const { queryClient, Wrapper } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: [] },
      });

      const { result } = renderHook(() => useUploadProductImages(mockProductId), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync(new FormData());
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "products"] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: CATALOG_QUERY_KEYS.product(mockProductId),
      });
    });

    it("useDeleteProductImage invalidates product detail and product list queries", async () => {
      const { queryClient, Wrapper } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true, data: null },
      });

      const { result } = renderHook(() => useDeleteProductImage(mockProductId), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync(mockImageId);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "products"] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: CATALOG_QUERY_KEYS.product(mockProductId),
      });
    });

    it("useReorderProductImages invalidates product detail query", async () => {
      const { queryClient, Wrapper } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { success: true, data: null },
      });

      const { result } = renderHook(() => useReorderProductImages(mockProductId), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync([{ id: mockImageId, sort_order: 1 }]);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: CATALOG_QUERY_KEYS.product(mockProductId),
      });
    });

    it("useCreateVariant invalidates product queries upon success", async () => {
      const { queryClient, Wrapper } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { id: mockVariantId, sku: "VAR-1", is_active: true } },
      });

      const { result } = renderHook(() => useCreateVariant(mockProductId), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ sku: "VAR-1" });
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "products"] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: CATALOG_QUERY_KEYS.product(mockProductId),
      });
    });

    it("useUpdateVariant invalidates product queries upon success", async () => {
      const { queryClient, Wrapper } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { success: true, data: { id: mockVariantId, sku: "VAR-1", is_active: true } },
      });

      const { result } = renderHook(() => useUpdateVariant(mockProductId), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ variantId: mockVariantId, data: { price: 10000 } });
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "products"] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: CATALOG_QUERY_KEYS.product(mockProductId),
      });
    });

    it("useDeleteVariant invalidates product queries upon success", async () => {
      const { queryClient, Wrapper } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true, data: null },
      });

      const { result } = renderHook(() => useDeleteVariant(mockProductId), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync(mockVariantId);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["admin", "products"] });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: CATALOG_QUERY_KEYS.product(mockProductId),
      });
    });
  });
});
