import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  storefrontService,
  PublicProductQueryParams,
} from "@/services/storefront-service";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

export const STOREFRONT_QUERY_KEYS = {
  products: (params: PublicProductQueryParams) => ["storefront", "products", params] as const,
  featured: (limit: number) => ["storefront", "featured", limit] as const,
  latest: (limit: number) => ["storefront", "latest", limit] as const,
  popular: (limit: number) => ["storefront", "popular", limit] as const,
  deals: (params: { page?: number; per_page?: number }) => ["storefront", "deals", params] as const,
  productBySlug: (slug: string) => ["storefront", "product", slug] as const,
  search: (query: string, params: PublicProductQueryParams) => ["storefront", "search", query, params] as const,
  suggestions: (query: string) => ["storefront", "suggestions", query] as const,
  categoriesTree: ["storefront", "categories"] as const,
  categoryBySlug: (slug: string) => ["storefront", "category", slug] as const,
  categoryProducts: (slug: string, params: PublicProductQueryParams) =>
    ["storefront", "category", slug, "products", params] as const,
  brands: ["storefront", "brands"] as const,
  brandBySlug: (slug: string) => ["storefront", "brand", slug] as const,
  brandProducts: (slug: string, params: PublicProductQueryParams) =>
    ["storefront", "brand", slug, "products", params] as const,
  reviews: (productId: string, params: { page?: number; per_page?: number }) =>
    ["storefront", "product", productId, "reviews", params] as const,
  trending: (limit: number) => ["storefront", "recommendations", "trending", limit] as const,
  similar: (productId: string, limit: number) =>
    ["storefront", "recommendations", "similar", productId, limit] as const,
};

export function usePublicProducts(params: PublicProductQueryParams = {}) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.products(params),
    queryFn: () => storefrontService.getPublicProducts(params),
    staleTime: 60 * 1000,
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.featured(limit),
    queryFn: () => storefrontService.getFeaturedProducts(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLatestProducts(limit = 8) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.latest(limit),
    queryFn: () => storefrontService.getLatestProducts(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePopularProducts(limit = 8) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.popular(limit),
    queryFn: () => storefrontService.getPopularProducts(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDealsProducts(params: { page?: number; per_page?: number } = {}) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.deals(params),
    queryFn: () => storefrontService.getDeals(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.productBySlug(slug),
    queryFn: () => storefrontService.getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}

export function useSearchProducts(query: string, params: PublicProductQueryParams = {}) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.search(query, params),
    queryFn: () => storefrontService.searchProducts(query, params),
    enabled: !!query,
    staleTime: 30 * 1000,
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.suggestions(query),
    queryFn: () => storefrontService.getSearchSuggestions(query),
    enabled: query.trim().length >= 2,
    staleTime: 60 * 1000,
  });
}

export function useCategoriesTree() {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.categoriesTree,
    queryFn: () => storefrontService.getCategoriesTree(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.categoryBySlug(slug),
    queryFn: () => storefrontService.getCategoryBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryProducts(slug: string, params: PublicProductQueryParams = {}) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.categoryProducts(slug, params),
    queryFn: () => storefrontService.getCategoryProducts(slug, params),
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.brands,
    queryFn: () => storefrontService.getBrands(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useBrandBySlug(slug: string) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.brandBySlug(slug),
    queryFn: () => storefrontService.getBrandBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBrandProducts(slug: string, params: PublicProductQueryParams = {}) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.brandProducts(slug, params),
    queryFn: () => storefrontService.getBrandProducts(slug, params),
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}

export function useProductReviews(productId: string, params: { page?: number; per_page?: number } = {}) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.reviews(productId, params),
    queryFn: () => storefrontService.getProductReviews(productId, params),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
}

export function useTrendingRecommendations(limit = 8) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.trending(limit),
    queryFn: () => storefrontService.getTrendingRecommendations(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSimilarRecommendations(productId: string, limit = 4) {
  return useQuery({
    queryKey: STOREFRONT_QUERY_KEYS.similar(productId, limit),
    queryFn: () => storefrontService.getSimilarRecommendations(productId, limit),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddToCart() {
  const { incrementCount, openCart } = useCartStore();

  return useMutation({
    mutationFn: ({
      productId,
      quantity = 1,
      variantId,
    }: {
      productId: string;
      quantity?: number;
      variantId?: string;
    }) => storefrontService.addToCart(productId, quantity, variantId),
    onSuccess: (_, variables) => {
      incrementCount(variables.quantity || 1);
      toast.success("Added to shopping bag!");
      openCart();
    },
    onError: () => {
      toast.error("Failed to add product to cart.");
    },
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, isWishlisted }: { productId: string; isWishlisted: boolean }) => {
      if (isWishlisted) {
        await storefrontService.removeFromWishlist(productId);
      } else {
        await storefrontService.addToWishlist(productId);
      }
    },
    onSuccess: (_, variables) => {
      toast.success(variables.isWishlisted ? "Removed from wishlist." : "Added to wishlist!");
      queryClient.invalidateQueries({ queryKey: ["customer", "wishlist"] });
    },
    onError: () => {
      toast.error("Please sign in to save items to your wishlist.");
    },
  });
}
