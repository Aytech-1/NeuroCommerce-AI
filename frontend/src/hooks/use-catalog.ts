import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogService, ProductQueryParams } from "@/services/catalog-service";

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

export function useCategories() {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.categories,
    queryFn: () => catalogService.getCategories(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: CATALOG_QUERY_KEYS.brands,
    queryFn: () => catalogService.getBrands(),
    staleTime: 5 * 60 * 1000,
  });
}

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
