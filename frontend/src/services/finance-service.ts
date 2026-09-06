import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";

export interface FinancialSalesSummary {
  total_revenue: number;
  net_revenue: number;
  total_tax: number;
  total_shipping: number;
  total_discounts: number;
  total_orders: number;
  avg_order_value: number;
  total_items_sold: number;
  refund_count: number;
  refund_amount: number;
}

export interface SalesChartData {
  granularity: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
  }>;
}

export interface RevenueCategoryBreakdown {
  id: string;
  name: string;
  revenue: number | string;
  units_sold: number | string;
}

export interface RevenueBrandBreakdown {
  id: string;
  name: string;
  revenue: number | string;
  units_sold: number | string;
}

export interface RevenueBreakdownResponse {
  summary: FinancialSalesSummary;
  by_category: RevenueCategoryBreakdown[];
  by_brand: RevenueBrandBreakdown[];
}

export interface TaxReportItem {
  currency_code: string;
  total_taxable_orders: number;
  taxable_amount: number | string;
  tax_collected: number | string;
}

export interface InventoryValuationReport {
  summary: {
    total_products: number;
    total_units_in_stock: number;
    total_cost_valuation: number;
    total_retail_valuation: number;
    potential_profit: number;
  };
  items: Array<{
    id: string;
    sku: string;
    name: string;
    base_price: number | string;
    cost_price: number | string;
    quantity: number;
    total_cost_value: number | string;
    total_retail_value: number | string;
  }>;
}

export interface FinanceQueryParams {
  start_date?: string;
  end_date?: string;
  granularity?: "daily" | "weekly" | "monthly" | "yearly";
}

export const financeService = {
  async getSalesSummary(params?: FinanceQueryParams): Promise<FinancialSalesSummary> {
    const response = await apiClient.get<ApiResponse<FinancialSalesSummary>>("/admin/analytics/sales", {
      params,
    });
    return response.data.data;
  },

  async getSalesChart(params?: FinanceQueryParams): Promise<SalesChartData> {
    const response = await apiClient.get<ApiResponse<SalesChartData>>("/admin/analytics/sales/chart", {
      params,
    });
    return response.data.data;
  },

  async getRevenueBreakdown(params?: FinanceQueryParams): Promise<RevenueBreakdownResponse> {
    const response = await apiClient.get<ApiResponse<RevenueBreakdownResponse>>("/admin/analytics/revenue", {
      params,
    });
    return response.data.data;
  },

  async getRevenueByCategory(params?: FinanceQueryParams): Promise<RevenueCategoryBreakdown[]> {
    const response = await apiClient.get<ApiResponse<RevenueCategoryBreakdown[]>>("/admin/analytics/revenue/by-category", {
      params,
    });
    return response.data.data;
  },

  async getRevenueByBrand(params?: FinanceQueryParams): Promise<RevenueBrandBreakdown[]> {
    const response = await apiClient.get<ApiResponse<RevenueBrandBreakdown[]>>("/admin/analytics/revenue/by-brand", {
      params,
    });
    return response.data.data;
  },

  async exportTaxReport(payload?: { start_date?: string; end_date?: string }): Promise<TaxReportItem[]> {
    const response = await apiClient.post<ApiResponse<TaxReportItem[]>>("/admin/reports/tax/export", payload);
    return response.data.data;
  },

  async exportInventoryValuation(): Promise<InventoryValuationReport> {
    const response = await apiClient.post<ApiResponse<InventoryValuationReport>>("/admin/reports/inventory/export");
    return response.data.data;
  },

  async exportOrdersCsv(payload?: { start_date?: string; end_date?: string; format?: string }): Promise<Blob> {
    const response = await apiClient.post("/admin/reports/orders/export", {
      ...payload,
      format: payload?.format || "csv",
    }, {
      responseType: "blob",
    });
    return response.data;
  },
};
