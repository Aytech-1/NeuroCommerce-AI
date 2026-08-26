import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  base_price: number;
  sale_price?: number | null;
  stock_quantity?: number;
  stock_status?: string;
  status: "draft" | "active" | "archived";
  is_active: boolean;
  is_featured: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
  brand?: {
    id: string;
    name: string;
  } | null;
  primary_image?: {
    id: string;
    url: string;
    alt_text?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price?: number | null;
  compare_at_price?: number | null;
  stock_quantity?: number;
  is_active: boolean;
  attribute_values?: Array<{
    id: string;
    value: string;
    attribute?: {
      id: string;
      name: string;
    };
  }>;
}

export interface ProductDetail extends ProductItem {
  description?: string | null;
  short_description?: string | null;
  compare_at_price?: number | null;
  cost_price?: number | null;
  weight?: number | null;
  weight_unit?: string | null;
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    is_primary: boolean;
    sort_order: number;
  }>;
  variants?: ProductVariant[];
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  is_active: boolean;
  products_count?: number;
}

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  website_url?: string | null;
  is_active: boolean;
  products_count?: number;
}

export interface ProductQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  category_id?: string;
  brand_id?: string;
  sort?: string;
}

export const catalogService = {
  async getProducts(params: ProductQueryParams = {}): Promise<{ data: ProductItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<ProductItem[]>>("/admin/products", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getProduct(id: string): Promise<ProductDetail> {
    const response = await apiClient.get<ApiResponse<ProductDetail>>(`/admin/products/${id}`);
    return response.data.data;
  },

  async createProduct(data: Record<string, unknown>): Promise<ProductDetail> {
    const response = await apiClient.post<ApiResponse<ProductDetail>>("/admin/products", data);
    return response.data.data;
  },

  async updateProduct(id: string, data: Record<string, unknown>): Promise<ProductDetail> {
    const response = await apiClient.put<ApiResponse<ProductDetail>>(`/admin/products/${id}`, data);
    return response.data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/products/${id}`);
  },

  async restoreProduct(id: string): Promise<void> {
    await apiClient.post<ApiResponse<null>>(`/admin/products/${id}/restore`);
  },

  async updateStatus(id: string, status: "draft" | "active" | "archived"): Promise<void> {
    await apiClient.patch<ApiResponse<null>>(`/admin/products/${id}/status`, { status });
  },

  async getCategories(): Promise<CategoryItem[]> {
    const response = await apiClient.get<ApiResponse<CategoryItem[]>>("/admin/categories");
    return response.data.data;
  },

  async createCategory(data: Partial<CategoryItem>): Promise<CategoryItem> {
    const response = await apiClient.post<ApiResponse<CategoryItem>>("/admin/categories", data);
    return response.data.data;
  },

  async getBrands(): Promise<BrandItem[]> {
    const response = await apiClient.get<ApiResponse<BrandItem[]>>("/admin/brands");
    return response.data.data;
  },

  async createBrand(data: Partial<BrandItem>): Promise<BrandItem> {
    const response = await apiClient.post<ApiResponse<BrandItem>>("/admin/brands", data);
    return response.data.data;
  },
};
