import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard-service";

export const DASHBOARD_QUERY_KEYS = {
  summary: ["admin", "dashboard", "summary"] as const,
  salesChart: (period: string) => ["admin", "dashboard", "sales-chart", period] as const,
  recentOrders: (limit: number) => ["admin", "dashboard", "recent-orders", limit] as const,
  topProducts: (limit: number) => ["admin", "dashboard", "top-products", limit] as const,
  lowStock: (limit: number) => ["admin", "dashboard", "low-stock", limit] as const,
  recentReviews: (limit: number) => ["admin", "dashboard", "recent-reviews", limit] as const,
};

export function useDashboardSummary() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.summary,
    queryFn: () => dashboardService.getSummary(),
    staleTime: 60 * 1000,
  });
}

export function useSalesChart(period = "daily") {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.salesChart(period),
    queryFn: () => dashboardService.getSalesChart(period),
    staleTime: 60 * 1000,
  });
}

export function useRecentOrders(limit = 10) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.recentOrders(limit),
    queryFn: () => dashboardService.getRecentOrders(limit),
    staleTime: 30 * 1000,
  });
}

export function useTopProducts(limit = 5) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.topProducts(limit),
    queryFn: () => dashboardService.getTopProducts(limit),
    staleTime: 60 * 1000,
  });
}

export function useLowStock(limit = 10) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.lowStock(limit),
    queryFn: () => dashboardService.getLowStock(limit),
    staleTime: 60 * 1000,
  });
}
