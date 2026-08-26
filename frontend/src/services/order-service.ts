import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface OrderAddress {
  id?: string;
  first_name?: string;
  last_name?: string;
  address_line_1?: string;
  address_line_2?: string | null;
  city?: string;
  state?: string | null;
  postal_code?: string;
  country_code?: string;
  phone?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  options?: Record<string, string> | null;
}

export interface OrderStatusHistoryItem {
  id: string;
  from_status?: string | null;
  to_status: string;
  comment?: string | null;
  changed_by?: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
  } | null;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_number: string;
  status: string;
  total_amount: number;
  issued_at: string;
  due_at?: string | null;
}

export interface OrderListItem {
  id: string;
  order_number: string;
  user_id?: string | null;
  status: "pending" | "processing" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded" | "on_hold";
  status_label: string;
  currency_code: string;
  total_amount: number;
  item_count: number;
  shipping_method?: string | null;
  payment_method?: string | null;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends OrderListItem {
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  coupon_code?: string | null;
  notes?: string | null;
  admin_notes?: string | null;
  billing_address?: OrderAddress | null;
  shipping_address?: OrderAddress | null;
  items?: OrderItem[];
  status_history?: OrderStatusHistoryItem[];
  invoices?: InvoiceItem[];
  placed_at?: string | null;
  paid_at?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
}

export interface OrderQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export const orderService = {
  async getOrders(params: OrderQueryParams = {}): Promise<{ data: OrderListItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<OrderListItem[]>>("/admin/orders", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getOrder(id: string): Promise<OrderDetail> {
    const response = await apiClient.get<ApiResponse<OrderDetail>>(`/admin/orders/${id}`);
    return response.data.data;
  },

  async updateStatus(id: string, status: string, comment?: string): Promise<OrderDetail> {
    const response = await apiClient.patch<ApiResponse<OrderDetail>>(`/admin/orders/${id}/status`, {
      status,
      comment,
    });
    return response.data.data;
  },

  async addNotes(id: string, notes: string): Promise<OrderDetail> {
    const response = await apiClient.post<ApiResponse<OrderDetail>>(`/admin/orders/${id}/notes`, {
      notes,
    });
    return response.data.data;
  },

  async getTimeline(id: string): Promise<OrderStatusHistoryItem[]> {
    const response = await apiClient.get<ApiResponse<OrderStatusHistoryItem[]>>(`/admin/orders/${id}/timeline`);
    return response.data.data;
  },
};
