import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

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
  meta_title?: string | null;
  meta_description?: string | null;
  products_count?: number;
  children?: CategoryItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  parent_id?: string | null;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  parent_id?: string | null;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
}

export const categoryService = {
  /**
   * List all categories (tree)
   */
  async getCategories(): Promise<CategoryItem[]> {
    const response = await apiClient.get<ApiResponse<CategoryItem[]>>("/admin/categories");
    return response.data.data;
  },

  /**
   * Create a new category
   */
  async createCategory(payload: CreateCategoryPayload): Promise<CategoryItem> {
    const response = await apiClient.post<ApiResponse<CategoryItem>>("/admin/categories", payload);
    return response.data.data;
  },

  /**
   * Update an existing category
   */
  async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<CategoryItem> {
    const response = await apiClient.put<ApiResponse<CategoryItem>>(`/admin/categories/${id}`, payload);
    return response.data.data;
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/categories/${id}`);
  },

  /**
   * Reorder categories tree
   */
  async reorderCategories(categories: { id: string; sort_order: number; parent_id?: string | null }[]): Promise<void> {
    await apiClient.put<ApiResponse<null>>("/admin/categories/reorder", { categories });
  },
};
