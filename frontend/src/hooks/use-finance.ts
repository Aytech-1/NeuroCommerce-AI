import { useQuery, useMutation } from "@tanstack/react-query";
import {
  financeService,
  FinanceQueryParams,
  FinancialSalesSummary,
  SalesChartData,
  RevenueBreakdownResponse,
  RevenueCategoryBreakdown,
  RevenueBrandBreakdown,
  TaxReportItem,
  InventoryValuationReport,
} from "@/services/finance-service";

export const FINANCE_QUERY_KEYS = {
  salesSummary: (params?: FinanceQueryParams) => ["finance", "sales-summary", params] as const,
  salesChart: (params?: FinanceQueryParams) => ["finance", "sales-chart", params] as const,
  revenueBreakdown: (params?: FinanceQueryParams) => ["finance", "revenue-breakdown", params] as const,
  revenueByCategory: (params?: FinanceQueryParams) => ["finance", "revenue-by-category", params] as const,
  revenueByBrand: (params?: FinanceQueryParams) => ["finance", "revenue-by-brand", params] as const,
  taxReport: (params?: { start_date?: string; end_date?: string }) => ["finance", "tax-report", params] as const,
  inventoryValuation: () => ["finance", "inventory-valuation"] as const,
};

export function useFinanceSalesSummary(params?: FinanceQueryParams) {
  return useQuery<FinancialSalesSummary, Error>({
    queryKey: FINANCE_QUERY_KEYS.salesSummary(params),
    queryFn: () => financeService.getSalesSummary(params),
    staleTime: 60 * 1000,
  });
}

export function useFinanceSalesChart(params?: FinanceQueryParams) {
  return useQuery<SalesChartData, Error>({
    queryKey: FINANCE_QUERY_KEYS.salesChart(params),
    queryFn: () => financeService.getSalesChart(params),
    staleTime: 60 * 1000,
  });
}

export function useFinanceRevenueBreakdown(params?: FinanceQueryParams) {
  return useQuery<RevenueBreakdownResponse, Error>({
    queryKey: FINANCE_QUERY_KEYS.revenueBreakdown(params),
    queryFn: () => financeService.getRevenueBreakdown(params),
    staleTime: 60 * 1000,
  });
}

export function useFinanceRevenueByCategory(params?: FinanceQueryParams) {
  return useQuery<RevenueCategoryBreakdown[], Error>({
    queryKey: FINANCE_QUERY_KEYS.revenueByCategory(params),
    queryFn: () => financeService.getRevenueByCategory(params),
    staleTime: 60 * 1000,
  });
}

export function useFinanceRevenueByBrand(params?: FinanceQueryParams) {
  return useQuery<RevenueBrandBreakdown[], Error>({
    queryKey: FINANCE_QUERY_KEYS.revenueByBrand(params),
    queryFn: () => financeService.getRevenueByBrand(params),
    staleTime: 60 * 1000,
  });
}

export function useFinanceTaxReport(params?: { start_date?: string; end_date?: string }, enabled = true) {
  return useQuery<TaxReportItem[], Error>({
    queryKey: FINANCE_QUERY_KEYS.taxReport(params),
    queryFn: () => financeService.exportTaxReport(params),
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useFinanceInventoryValuation(enabled = false) {
  return useQuery<InventoryValuationReport, Error>({
    queryKey: FINANCE_QUERY_KEYS.inventoryValuation(),
    queryFn: () => financeService.exportInventoryValuation(),
    staleTime: 60 * 1000,
    enabled,
  });
}

export function useExportOrdersMutation() {
  return useMutation({
    mutationFn: (payload?: { start_date?: string; end_date?: string; format?: string }) =>
      financeService.exportOrdersCsv(payload),
  });
}
