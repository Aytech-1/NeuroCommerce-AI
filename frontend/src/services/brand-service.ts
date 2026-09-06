import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export interface BrandItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_active: boolean;
  sort_order: number;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBrandPayload {
  name: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateBrandPayload {
  name?: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active?: boolean;
  sort_order?: number;
}

export const brandService = {
  /**
   * Get all brands for admin portal.
   */
  async getBrands(): Promise<BrandItem[]> {
    const response = await apiClient.get<ApiResponse<BrandItem[]>>("/admin/brands", {
      params: { per_page: 100 },
    });
    return response.data.data;
  },

  /**
   * Create a new brand.
   */
  async createBrand(payload: CreateBrandPayload): Promise<BrandItem> {
    const response = await apiClient.post<ApiResponse<BrandItem>>("/admin/brands", payload);
    return response.data.data;
  },

  /**
   * Update an existing brand.
   */
  async updateBrand(id: string, payload: UpdateBrandPayload): Promise<BrandItem> {
    const response = await apiClient.put<ApiResponse<BrandItem>>(`/admin/brands/${id}`, payload);
    return response.data.data;
  },

  /**
   * Delete a brand (soft delete).
   */
  async deleteBrand(id: string): Promise<void> {
    await apiClient.delete(`/admin/brands/${id}`);
  },
};
