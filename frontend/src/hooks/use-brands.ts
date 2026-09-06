import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  brandService,
  BrandItem,
  CreateBrandPayload,
  UpdateBrandPayload,
} from "@/services/brand-service";

export const BRAND_QUERY_KEYS = {
  all: ["admin", "brands"] as const,
  storefront: ["brands"] as const,
  detail: (id: string) => ["admin", "brands", id] as const,
};

export function useBrands() {
  return useQuery<BrandItem[]>({
    queryKey: BRAND_QUERY_KEYS.all,
    queryFn: () => brandService.getBrands(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBrandPayload) => brandService.createBrand(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.storefront });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBrandPayload }) =>
      brandService.updateBrand(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.storefront });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: BRAND_QUERY_KEYS.storefront });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
