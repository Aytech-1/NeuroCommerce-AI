import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  catalogService,
  ProductQueryParams,
  ImageReorderItem,
  CreateVariantPayload,
  UpdateVariantPayload,
} from "@/services/catalog-service";

export const CATALOG_QUERY_KEYS = {
  products: (params: ProductQueryParams) => ["admin", "products", params] as const,
  product: (id: string) => ["admin", "products", id] as const,
  categories: ["admin", "categories"] as const,
  brands: ["admin", "brands"] as const,
};

export function useProducts(params: ProductQueryParams = {}) {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.products(params),
    queryFn: () => catalogService.getProducts(params),
    staleTime: 30 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.product(id),
    queryFn: () => catalogService.getProduct(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
} from "./use-categories";

export {
  useBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "./use-brands";

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "draft" | "active" | "archived" }) =>
      catalogService.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEYS.product(variables.id) });
    },
  });
}

export function useUploadProductImages(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => catalogService.uploadProductImages(productId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEYS.product(productId) });
    },
  });
}

export function useDeleteProductImage(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => catalogService.deleteProductImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEYS.product(productId) });
    },
  });
}

export function useReorderProductImages(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (images: ImageReorderItem[]) => catalogService.reorderProductImages(productId, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEYS.product(productId) });
    },
  });
}

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVariantPayload) => catalogService.createProductVariant(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEYS.product(productId) });
    },
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: UpdateVariantPayload }) =>
      catalogService.updateProductVariant(productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEYS.product(productId) });
    },
  });
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variantId: string) => catalogService.deleteProductVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: CATALOG_QUERY_KEYS.product(productId) });
    },
  });
}
