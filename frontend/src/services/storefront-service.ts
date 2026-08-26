import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";
import { ProductItem, ProductDetail, CategoryItem, BrandItem } from "./catalog-service";
import { ReviewItem } from "./review-service";

export interface PublicProductQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  brand?: string;
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
  sort?: string;
}

export interface SearchSuggestionItem {
  id: string;
  name: string;
  slug: string;
  type?: "product" | "category" | "brand";
  price?: number;
}

export const storefrontService = {
  async getPublicProducts(
    params: PublicProductQueryParams = {}
  ): Promise<{ data: ProductItem[]; meta?: PaginationMeta }> {
    const queryParams: Record<string, unknown> = {
      page: params.page,
      per_page: params.per_page,
    };

    if (params.search) queryParams["filter[search]"] = params.search;
    if (params.category) queryParams["filter[category]"] = params.category;
    if (params.brand) queryParams["filter[brand]"] = params.brand;
    if (params.price_min !== undefined) queryParams["filter[price_min]"] = params.price_min;
    if (params.price_max !== undefined) queryParams["filter[price_max]"] = params.price_max;
    if (params.in_stock) queryParams["filter[in_stock]"] = true;
    if (params.sort) queryParams.sort = params.sort;

    const response = await apiClient.get<ApiResponse<ProductItem[]>>("/products", {
      params: queryParams,
    });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getFeaturedProducts(limit = 8): Promise<ProductItem[]> {
    const response = await apiClient.get<ApiResponse<ProductItem[]>>("/products/featured", {
      params: { limit },
    });
    return response.data.data;
  },

  async getLatestProducts(limit = 8): Promise<ProductItem[]> {
    const response = await apiClient.get<ApiResponse<ProductItem[]>>("/products/latest", {
      params: { limit },
    });
    return response.data.data;
  },

  async getPopularProducts(limit = 8): Promise<ProductItem[]> {
    const response = await apiClient.get<ApiResponse<ProductItem[]>>("/products/popular", {
      params: { limit },
    });
    return response.data.data;
  },

  async getDeals(params: { page?: number; per_page?: number } = {}): Promise<{ data: ProductItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<ProductItem[]>>("/products/deals", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getProductBySlug(slug: string): Promise<ProductDetail> {
    const response = await apiClient.get<ApiResponse<ProductDetail>>(`/products/${encodeURIComponent(slug)}`);
    return response.data.data;
  },

  async searchProducts(
    query: string,
    params: PublicProductQueryParams = {}
  ): Promise<{ data: ProductItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<ProductItem[]>>("/search", {
      params: {
        q: query,
        ...params,
      },
    });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getSearchSuggestions(query: string, limit = 5): Promise<SearchSuggestionItem[]> {
    if (!query.trim()) return [];
    const response = await apiClient.get<ApiResponse<SearchSuggestionItem[]>>("/search/suggestions", {
      params: { q: query, limit },
    });
    return response.data.data;
  },

  async getCategoriesTree(): Promise<CategoryItem[]> {
    const response = await apiClient.get<ApiResponse<CategoryItem[]>>("/categories");
    return response.data.data;
  },

  async getCategoryBySlug(slug: string): Promise<CategoryItem> {
    const response = await apiClient.get<ApiResponse<CategoryItem>>(`/categories/${encodeURIComponent(slug)}`);
    return response.data.data;
  },

  async getCategoryProducts(
    slug: string,
    params: PublicProductQueryParams = {}
  ): Promise<{ data: ProductItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<ProductItem[]>>(`/categories/${encodeURIComponent(slug)}/products`, {
      params,
    });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getBrands(): Promise<BrandItem[]> {
    const response = await apiClient.get<ApiResponse<BrandItem[]>>("/brands");
    return response.data.data;
  },

  async getBrandBySlug(slug: string): Promise<BrandItem> {
    const response = await apiClient.get<ApiResponse<BrandItem>>(`/brands/${encodeURIComponent(slug)}`);
    return response.data.data;
  },

  async getBrandProducts(
    slug: string,
    params: PublicProductQueryParams = {}
  ): Promise<{ data: ProductItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<ProductItem[]>>(`/brands/${encodeURIComponent(slug)}/products`, {
      params,
    });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getProductReviews(
    productId: string,
    params: { page?: number; per_page?: number } = {}
  ): Promise<{ data: ReviewItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<ReviewItem[]>>(`/products/${productId}/reviews`, {
      params,
    });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getTrendingRecommendations(limit = 8): Promise<ProductItem[]> {
    const response = await apiClient.get<ApiResponse<ProductItem[]>>("/recommendations/trending", {
      params: { limit },
    });
    return response.data.data;
  },

  async getSimilarRecommendations(productId: string, limit = 4): Promise<ProductItem[]> {
    const response = await apiClient.get<ApiResponse<ProductItem[]>>(`/recommendations/similar/${productId}`, {
      params: { limit },
    });
    return response.data.data;
  },

  async addToCart(productId: string, quantity = 1, variantId?: string): Promise<void> {
    await apiClient.post("/cart/items", {
      product_id: productId,
      quantity,
      variant_id: variantId,
    });
  },

  async addToWishlist(productId: string): Promise<void> {
    await apiClient.post("/customer/wishlist", {
      product_id: productId,
    });
  },

  async removeFromWishlist(productId: string): Promise<void> {
    await apiClient.delete(`/customer/wishlist/${productId}`);
  },
};
