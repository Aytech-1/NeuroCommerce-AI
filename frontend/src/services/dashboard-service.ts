import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export interface DashboardSummary {
  revenue: {
    total: number;
    this_month: number;
  };
  orders: {
    total: number;
    this_month: number;
  };
  customers: {
    total: number;
    new_this_month: number;
  };
  products: {
    total: number;
    active: number;
  };
}

export interface SalesChartPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  items?: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export interface TopProduct {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  total_sold: number;
  stock_quantity: number;
  category?: {
    id: string;
    name: string;
  } | null;
  brand?: {
    id: string;
    name: string;
  } | null;
}

export interface LowStockItem {
  id: string;
  name: string;
  sku?: string | null;
  stock_quantity: number;
  stock_status: string;
  category?: {
    id: string;
    name: string;
  } | null;
}

export interface RecentReview {
  id: string;
  rating: number;
  comment?: string | null;
  status: string;
  created_at: string;
  product?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>("/admin/dashboard/summary");
    return response.data.data;
  },

  async getSalesChart(period = "daily"): Promise<SalesChartPoint[]> {
    const response = await apiClient.get<ApiResponse<SalesChartPoint[]>>("/admin/dashboard/sales-chart", {
      params: { period },
    });
    return response.data.data;
  },

  async getRecentOrders(limit = 10): Promise<RecentOrder[]> {
    const response = await apiClient.get<ApiResponse<RecentOrder[]>>("/admin/dashboard/recent-orders", {
      params: { limit },
    });
    return response.data.data;
  },

  async getTopProducts(limit = 5): Promise<TopProduct[]> {
    const response = await apiClient.get<ApiResponse<TopProduct[]>>("/admin/dashboard/top-products", {
      params: { limit },
    });
    return response.data.data;
  },

  async getLowStock(limit = 10): Promise<LowStockItem[]> {
    const response = await apiClient.get<ApiResponse<LowStockItem[]>>("/admin/dashboard/low-stock", {
      params: { limit },
    });
    return response.data.data;
  },

  async getRecentReviews(limit = 5): Promise<RecentReview[]> {
    const response = await apiClient.get<ApiResponse<RecentReview[]>>("/admin/dashboard/recent-reviews", {
      params: { limit },
    });
    return response.data.data;
  },
};
