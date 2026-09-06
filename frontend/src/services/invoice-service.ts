import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface InvoiceAddressItem {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state_province?: string | null;
  postal_code: string;
  country_code: string;
  phone?: string | null;
}

export interface InvoiceOrderItem {
  id: string;
  product_id: string;
  variant_id?: string | null;
  product_sku: string;
  product_name: string;
  variant_name?: string | null;
  unit_price: number;
  tax_amount: number;
  discount_amount: number;
  quantity: number;
  line_total: number;
}

export interface InvoiceItem {
  id: string;
  order_id: string;
  invoice_number: string;
  status: "draft" | "issued" | "paid" | "void" | string;
  status_label?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency_code: string;
  issued_at?: string | null;
  paid_at?: string | null;
  pdf_url?: string | null;
  created_at: string;
  order?: {
    id: string;
    order_number: string;
    status: string;
    subtotal: number;
    tax_amount: number;
    shipping_amount: number;
    discount_amount: number;
    total_amount: number;
    currency_code: string;
    shipping_method?: string | null;
    payment_method?: string | null;
    coupon_code?: string | null;
    placed_at?: string | null;
    user?: {
      id: string;
      name: string;
      email: string;
    } | null;
    billing_address?: InvoiceAddressItem | null;
    shipping_address?: InvoiceAddressItem | null;
    items?: InvoiceOrderItem[];
  } | null;
}

export interface InvoiceQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  currency_code?: string;
  search?: string;
}

export const invoiceService = {
  async getInvoices(params: InvoiceQueryParams = {}): Promise<{ data: InvoiceItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<InvoiceItem[]>>("/admin/invoices", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getInvoice(id: string): Promise<InvoiceItem> {
    const response = await apiClient.get<ApiResponse<InvoiceItem>>(`/admin/invoices/${id}`);
    return response.data.data;
  },
};
