import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface ShipTrackingEventItem {
  id: string;
  shipment_id?: string;
  status: string;
  location: string | null;
  description: string | null;
  occurred_at: string;
  created_at?: string;
}

export interface ShipmentItem {
  id: string;
  order_id: string;
  order_number?: string | null;
  warehouse_id: string;
  warehouse_name?: string | null;
  carrier: string;
  service_level: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  status: string;
  status_label?: string;
  shipped_at: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  weight: number | null;
  cost: number | null;
  label_url: string | null;
  tracking_events?: ShipTrackingEventItem[];
  created_at: string;
  updated_at: string;
  order?: {
    id: string;
    order_number: string;
    user_id?: string;
    status: string;
    total_amount: number;
    currency_code?: string;
    user?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
    };
    shipping_address?: {
      id?: string;
      first_name?: string;
      last_name?: string;
      address_line_1: string;
      address_line_2?: string | null;
      city: string;
      state: string;
      postal_code: string;
      country_code: string;
      phone?: string;
    };
  };
  warehouse?: {
    id: string;
    name: string;
    code: string;
    contact_email?: string | null;
    contact_phone?: string | null;
    address?: {
      address_line_1: string;
      city: string;
      state: string;
      postal_code: string;
      country_code: string;
    } | null;
  };
}

export interface WarehouseItem {
  id: string;
  name: string;
  code: string;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_active: boolean;
}

export interface ShippingRateItem {
  id: string;
  zone_id: string;
  zone_name?: string;
  carrier: string;
  service_level: string;
  min_weight?: number | null;
  max_weight?: number | null;
  min_order_amount?: number | null;
  rate: number;
  currency_code: string;
  estimated_days_min?: number | null;
  estimated_days_max?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShipmentPayload {
  warehouse_id: string;
  carrier: string;
  service_level?: string;
  tracking_number?: string;
  tracking_url?: string;
  weight?: number;
  cost?: number;
  label_url?: string;
}

export interface UpdateShipmentStatusPayload {
  status: string;
  location?: string;
  description?: string;
}

export interface ShipmentFilterParams {
  status?: string;
  carrier?: string;
  warehouse_id?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export const shippingService = {
  /**
   * Fetch paginated shipments with server-side filters
   */
  getShipments: async (params: ShipmentFilterParams = {}): Promise<{ data: ShipmentItem[]; meta?: PaginationMeta }> => {
    const response = await apiClient.get<ApiResponse<ShipmentItem[]>>("/admin/shipments", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  /**
   * Fetch single shipment details
   */
  getShipment: async (id: string): Promise<ShipmentItem> => {
    const response = await apiClient.get<ApiResponse<ShipmentItem>>(`/admin/shipments/${id}`);
    return response.data.data;
  },

  /**
   * Create shipment for order
   */
  createShipmentForOrder: async (orderId: string, payload: CreateShipmentPayload): Promise<ShipmentItem> => {
    const response = await apiClient.post<ApiResponse<ShipmentItem>>(`/admin/orders/${orderId}/shipment`, payload);
    return response.data.data;
  },

  /**
   * Update shipment status
   */
  updateShipmentStatus: async (id: string, payload: UpdateShipmentStatusPayload): Promise<ShipmentItem> => {
    const response = await apiClient.patch<ApiResponse<ShipmentItem>>(`/admin/shipments/${id}/status`, payload);
    return response.data.data;
  },

  /**
   * Fetch warehouses for warehouse selection
   */
  getWarehouses: async (): Promise<WarehouseItem[]> => {
    const response = await apiClient.get<ApiResponse<WarehouseItem[]>>(`/admin/warehouses?per_page=100`);
    return response.data.data;
  },

  /**
   * Fetch shipping methods / rates
   */
  getShippingMethods: async (): Promise<ShippingRateItem[]> => {
    const response = await apiClient.get<ApiResponse<ShippingRateItem[]>>(`/admin/shipping-methods?per_page=100`);
    return response.data.data;
  },
};
