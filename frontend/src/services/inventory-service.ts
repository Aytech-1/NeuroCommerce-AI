import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta } from "@/types/api";

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address_id?: string;
  is_active: boolean;
  is_default: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

export interface StockMovement {
  id: string;
  inventory_item_id: string;
  movement_type: "receipt" | "sale" | "return" | "adjustment" | "transfer" | "reservation" | "release";
  quantity: number;
  reference_type?: string | null;
  reference_id?: string | null;
  notes?: string | null;
  performer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    slug?: string | null;
  };
  variant_id?: string | null;
  variant?: {
    id: string;
    name?: string | null;
    sku: string;
  } | null;
  warehouse_id: string;
  warehouse?: Warehouse;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  reorder_point: number;
  reorder_quantity: number;
  is_low_stock: boolean;
  is_out_of_stock: boolean;
  movements?: StockMovement[];
  updated_at?: string;
}

export interface InventoryFilterParams {
  product_id?: string;
  variant_id?: string;
  warehouse_id?: string;
  low_stock?: boolean;
  out_of_stock?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface AdjustStockPayload {
  product_id: string;
  variant_id?: string | null;
  warehouse_id: string;
  quantity_delta: number;
  movement_type: "receipt" | "sale" | "return" | "adjustment" | "transfer" | "reservation" | "release";
  notes?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
}

export interface TransferStockPayload {
  source_warehouse_id: string;
  destination_warehouse_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  notes?: string | null;
}

export const inventoryService = {
  /**
   * List inventory items with optional filters
   */
  async listInventory(params: InventoryFilterParams = {}): Promise<{ data: InventoryItem[]; meta?: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.per_page) query.append("per_page", String(params.per_page));
    if (params.search) query.append("search", params.search);
    if (params.product_id) query.append("filter[product_id]", params.product_id);
    if (params.variant_id) query.append("filter[variant_id]", params.variant_id);
    if (params.warehouse_id) query.append("filter[warehouse_id]", params.warehouse_id);
    if (params.low_stock !== undefined) query.append("filter[low_stock]", String(params.low_stock));
    if (params.out_of_stock !== undefined) query.append("filter[out_of_stock]", String(params.out_of_stock));

    const qs = query.toString();
    const response = await apiClient.get<ApiResponse<InventoryItem[]>>(`/admin/inventory${qs ? `?${qs}` : ""}`);
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  /**
   * Get single inventory item by ID
   */
  async getInventoryItem(id: string): Promise<InventoryItem> {
    const response = await apiClient.get<ApiResponse<InventoryItem>>(`/admin/inventory/${id}`);
    return response.data.data;
  },

  /**
   * Adjust inventory stock levels
   */
  async adjustStock(payload: AdjustStockPayload): Promise<InventoryItem> {
    const response = await apiClient.post<ApiResponse<InventoryItem>>("/admin/inventory/adjust", payload);
    return response.data.data;
  },

  /**
   * Transfer inventory between warehouses
   */
  async transferStock(payload: TransferStockPayload): Promise<{ source_item: InventoryItem; destination_item: InventoryItem }> {
    const response = await apiClient.post<ApiResponse<{ source_item: InventoryItem; destination_item: InventoryItem }>>(
      "/admin/inventory/transfer",
      payload
    );
    return response.data.data;
  },

  /**
   * List low stock inventory items
   */
  async getLowStock(params: { per_page?: number; page?: number } = {}): Promise<{ data: InventoryItem[]; meta?: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.per_page) query.append("per_page", String(params.per_page));

    const qs = query.toString();
    const response = await apiClient.get<ApiResponse<InventoryItem[]>>(`/admin/inventory/low-stock${qs ? `?${qs}` : ""}`);
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  /**
   * List stock movements
   */
  async getMovements(
    params: { inventory_item_id?: string; movement_type?: string; per_page?: number; page?: number } = {}
  ): Promise<{ data: StockMovement[]; meta?: PaginationMeta }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.per_page) query.append("per_page", String(params.per_page));
    if (params.inventory_item_id) query.append("filter[inventory_item_id]", params.inventory_item_id);
    if (params.movement_type) query.append("filter[movement_type]", params.movement_type);

    const qs = query.toString();
    const response = await apiClient.get<ApiResponse<StockMovement[]>>(`/admin/inventory/movements${qs ? `?${qs}` : ""}`);
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  /**
   * List all warehouses
   */
  async listWarehouses(): Promise<Warehouse[]> {
    const response = await apiClient.get<ApiResponse<Warehouse[]>>("/admin/warehouses");
    return response.data.data;
  },
};
