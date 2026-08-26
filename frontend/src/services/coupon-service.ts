import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface CouponItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  type: "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";
  value: number;
  min_order_amount?: number | null;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  usage_limit_per_user?: number | null;
  times_used: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponUsageItem {
  id: string;
  coupon_id: string;
  order_id: string;
  user_id?: string | null;
  discount_amount: number;
  created_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface CouponQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  type?: string;
  is_active?: boolean | string;
}

export const couponService = {
  async getCoupons(params: CouponQueryParams = {}): Promise<{ data: CouponItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<CouponItem[]>>("/admin/coupons", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getCoupon(id: string): Promise<CouponItem> {
    const response = await apiClient.get<ApiResponse<CouponItem>>(`/admin/coupons/${id}`);
    return response.data.data;
  },

  async createCoupon(data: Record<string, unknown>): Promise<CouponItem> {
    const response = await apiClient.post<ApiResponse<CouponItem>>("/admin/coupons", data);
    return response.data.data;
  },

  async updateCoupon(id: string, data: Record<string, unknown>): Promise<CouponItem> {
    const response = await apiClient.put<ApiResponse<CouponItem>>(`/admin/coupons/${id}`, data);
    return response.data.data;
  },

  async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/coupons/${id}`);
  },

  async getCouponUsage(
    id: string,
    params: { page?: number; per_page?: number } = {}
  ): Promise<{ data: CouponUsageItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<CouponUsageItem[]>>(`/admin/coupons/${id}/usage`, {
      params,
    });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },
};
