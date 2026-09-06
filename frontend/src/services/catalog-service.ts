import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface ProductItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  currency_code?: string | null;
  base_price: number;
  sale_price?: number | null;
  stock_quantity?: number;
  stock_status?: string;
  status: "draft" | "active" | "archived";
  is_active: boolean;
  is_featured: boolean;
  avg_rating?: number | string | null;
  review_count?: number | null;
  total_sold?: number | null;
  category?: {
    id: string;
    name: string;
    slug?: string;
  } | null;
  brand?: {
    id: string;
    name: string;
    slug?: string;
    logo_url?: string | null;
  } | null;
  primary_image?: {
    id: string;
    url: string;
    alt_text?: string | null;
    is_primary?: boolean;
    sort_order?: number;
  } | null;
  primary_image_url?: string | null;
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name?: string | null;
  price?: number | null;
  compare_at_price?: number | null;
  cost_price?: number | null;
  weight?: number | null;
  barcode?: string | null;
  image_url?: string | null;
  stock_quantity?: number;
  is_active: boolean;
  sort_order?: number;
  attributes?: Array<{
    attribute_id?: string;
    attribute_name?: string;
    attribute_slug?: string;
    value_id?: string;
    value: string;
    color_hex?: string | null;
  }>;
  attribute_values?: Array<{
    id: string;
    value: string;
    color_hex?: string | null;
    attribute?: {
      id: string;
      name: string;
      slug?: string;
    };
  }>;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at?: string;
}

export interface ImageReorderItem {
  id: string;
  sort_order: number;
}

export interface CreateVariantPayload {
  sku: string;
  name?: string | null;
  price?: number | null;
  compare_at_price?: number | null;
  cost_price?: number | null;
  weight?: number | null;
  barcode?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
  attribute_value_ids?: string[];
}

export interface UpdateVariantPayload {
  sku?: string;
  name?: string | null;
  price?: number | null;
  compare_at_price?: number | null;
  cost_price?: number | null;
  weight?: number | null;
  barcode?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
  attribute_value_ids?: string[];
}

export interface ProductDetail extends ProductItem {
  description?: string | null;
  short_description?: string | null;
  compare_at_price?: number | null;
  cost_price?: number | null;
  currency_code?: string | null;
  tax_class?: string | null;
  weight?: number | null;
  weight_unit?: string | null;
  length?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
  is_digital?: boolean;
  images?: ProductImage[];
  variants?: ProductVariant[];
  tags?: Array<{ id: string; name: string; slug: string }>;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_id?: string | null;
  sort_order?: number;
  depth?: number;
  is_active: boolean;
  products_count?: number;
  meta_title?: string | null;
  meta_description?: string | null;
  children?: CategoryItem[];
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

  async updateCategory(id: string, data: Partial<CategoryItem>): Promise<CategoryItem> {
    const response = await apiClient.put<ApiResponse<CategoryItem>>(`/admin/categories/${id}`, data);
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/categories/${id}`);
  },

  async reorderCategories(categories: { id: string; sort_order: number; parent_id?: string | null }[]): Promise<void> {
    await apiClient.put<ApiResponse<null>>("/admin/categories/reorder", { categories });
  },

  async getBrands(): Promise<BrandItem[]> {
    const response = await apiClient.get<ApiResponse<BrandItem[]>>("/admin/brands");
    return response.data.data;
  },

  async createBrand(data: Partial<BrandItem>): Promise<BrandItem> {
    const response = await apiClient.post<ApiResponse<BrandItem>>("/admin/brands", data);
    return response.data.data;
  },

  async updateBrand(id: string, data: Partial<BrandItem>): Promise<BrandItem> {
    const response = await apiClient.put<ApiResponse<BrandItem>>(`/admin/brands/${id}`, data);
    return response.data.data;
  },

  async deleteBrand(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/brands/${id}`);
  },

  async uploadProductImages(productId: string, formData: FormData): Promise<ProductImage[]> {
    const response = await apiClient.post<ApiResponse<ProductImage[]>>(
      `/admin/products/${productId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  async deleteProductImage(productId: string, imageId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/products/${productId}/images/${imageId}`);
  },

  async reorderProductImages(productId: string, images: ImageReorderItem[]): Promise<void> {
    await apiClient.put<ApiResponse<null>>(`/admin/products/${productId}/images/reorder`, { images });
  },

  async createProductVariant(productId: string, data: CreateVariantPayload): Promise<ProductVariant> {
    const response = await apiClient.post<ApiResponse<ProductVariant>>(
      `/admin/products/${productId}/variants`,
      data
    );
    return response.data.data;
  },

  async updateProductVariant(
    productId: string,
    variantId: string,
    data: UpdateVariantPayload
  ): Promise<ProductVariant> {
    const response = await apiClient.put<ApiResponse<ProductVariant>>(
      `/admin/products/${productId}/variants/${variantId}`,
      data
    );
    return response.data.data;
  },

  async deleteProductVariant(productId: string, variantId: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/products/${productId}/variants/${variantId}`);
  },
};
