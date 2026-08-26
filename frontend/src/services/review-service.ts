import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface ReviewItem {
  id: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    slug: string;
  } | null;
  user_id?: string | null;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string | null;
  } | null;
  order_id?: string | null;
  rating: number;
  title?: string | null;
  body: string;
  images?: string[] | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  helpful_count: number;
  admin_reply?: string | null;
  admin_reply_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_approved?: boolean | string;
  is_featured?: boolean | string;
  rating?: number | string;
  product_id?: string;
}

export const reviewService = {
  async getReviews(params: ReviewQueryParams = {}): Promise<{ data: ReviewItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<ReviewItem[]>>("/admin/reviews", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async approveReview(id: string): Promise<ReviewItem> {
    const response = await apiClient.patch<ApiResponse<ReviewItem>>(`/admin/reviews/${id}/approve`);
    return response.data.data;
  },

  async rejectReview(id: string): Promise<ReviewItem> {
    const response = await apiClient.patch<ApiResponse<ReviewItem>>(`/admin/reviews/${id}/reject`);
    return response.data.data;
  },

  async toggleFeatureReview(id: string): Promise<ReviewItem> {
    const response = await apiClient.patch<ApiResponse<ReviewItem>>(`/admin/reviews/${id}/feature`);
    return response.data.data;
  },

  async replyToReview(id: string, reply: string): Promise<ReviewItem> {
    const response = await apiClient.post<ApiResponse<ReviewItem>>(`/admin/reviews/${id}/reply`, {
      reply,
    });
    return response.data.data;
  },

  async deleteReview(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/reviews/${id}`);
  },
};
