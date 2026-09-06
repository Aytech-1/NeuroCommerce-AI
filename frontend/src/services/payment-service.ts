import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface PaymentTransactionItem {
  id: string;
  type: string;
  amount: number;
  currency_code: string;
  gateway_transaction_id?: string | null;
  status: string;
  created_at: string;
}

export interface RefundItem {
  id: string;
  payment_id: string;
  order_id: string;
  amount: number;
  reason?: string | null;
  status: string;
  gateway_refund_id?: string | null;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentItem {
  id: string;
  order_id: string;
  gateway: string;
  gateway_payment_id?: string | null;
  method: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded" | "partially_refunded" | "cancelled";
  amount: number;
  currency_code: string;
  card_last_four?: string | null;
  card_brand?: string | null;
  paid_at?: string | null;
  failed_at?: string | null;
  failure_reason?: string | null;
  transactions?: PaymentTransactionItem[];
  refunds?: RefundItem[];
  order?: {
    id: string;
    order_number: string;
    user_id?: string | null;
    user?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    } | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  gateway?: string;
}

export interface ProcessRefundPayload {
  amount: number;
  reason?: string;
}

export const paymentService = {
  async getPayments(params: PaymentQueryParams = {}): Promise<{ data: PaymentItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<PaymentItem[]>>("/admin/payments", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getPayment(id: string): Promise<PaymentItem> {
    const response = await apiClient.get<ApiResponse<PaymentItem>>(`/admin/payments/${id}`);
    return response.data.data;
  },

  async processRefund(id: string, payload: ProcessRefundPayload): Promise<RefundItem> {
    const response = await apiClient.post<ApiResponse<RefundItem>>(`/admin/payments/${id}/refund`, payload);
    return response.data.data;
  },
};