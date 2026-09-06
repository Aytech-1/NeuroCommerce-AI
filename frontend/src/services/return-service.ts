import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface RefundItem {
  id: string;
  payment_id: string;
  order_id: string;
  amount: number;
  reason?: string | null;
  status: "pending" | "approved" | "processed" | "rejected" | string;
  gateway_refund_id?: string | null;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at: string;
  updated_at: string;
  payment?: {
    id: string;
    order_id: string;
    gateway: string;
    method: string;
    status: string;
    amount: number;
    currency_code: string;
    card_last_four?: string | null;
    card_brand?: string | null;
    paid_at?: string | null;
  } | null;
  order?: {
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    currency_code: string;
    user?: {
      id: string;
      name: string;
      email: string;
    } | null;
  } | null;
  processor?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface ReturnQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  order_id?: string;
  search?: string;
}

export interface ProcessRefundPayload {
  amount: number;
  reason?: string;
}

export const returnService = {
  async getRefunds(params: ReturnQueryParams = {}): Promise<{ data: RefundItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<RefundItem[]>>("/admin/refunds", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getRefund(id: string): Promise<RefundItem> {
    const response = await apiClient.get<ApiResponse<RefundItem>>(`/admin/refunds/${id}`);
    return response.data.data;
  },

  async processRefund(paymentId: string, payload: ProcessRefundPayload): Promise<RefundItem> {
    const response = await apiClient.post<ApiResponse<RefundItem>>(`/admin/payments/${paymentId}/refund`, payload);
    return response.data.data;
  },
};
