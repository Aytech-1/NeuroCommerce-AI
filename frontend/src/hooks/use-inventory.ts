"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inventoryService,
  InventoryFilterParams,
  AdjustStockPayload,
  TransferStockPayload,
} from "@/services/inventory-service";

export const INVENTORY_QUERY_KEYS = {
  all: ["admin", "inventory"] as const,
  list: (params?: InventoryFilterParams) => ["admin", "inventory", "list", params] as const,
  detail: (id: string) => ["admin", "inventory", "detail", id] as const,
  product: (productId: string) => ["admin", "inventory", "product", productId] as const,
  lowStock: (params?: { per_page?: number; page?: number }) => ["admin", "inventory", "low-stock", params] as const,
  movements: (params?: Record<string, unknown>) => ["admin", "inventory", "movements", params] as const,
  warehouses: ["admin", "warehouses"] as const,
};

export function useInventory(params: InventoryFilterParams = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.list(params),
    queryFn: () => inventoryService.listInventory(params),
    enabled: options.enabled ?? true,
    staleTime: 30 * 1000,
  });
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.detail(id),
    queryFn: () => inventoryService.getInventoryItem(id),
    enabled: Boolean(id),
  });
}

export function useProductInventory(productId: string) {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.product(productId),
    queryFn: () => inventoryService.listInventory({ product_id: productId, per_page: 50 }),
    enabled: Boolean(productId),
    staleTime: 30 * 1000,
  });
}

export function useLowStock(params: { per_page?: number; page?: number } = {}) {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.lowStock(params),
    queryFn: () => inventoryService.getLowStock(params),
    staleTime: 30 * 1000,
  });
}

export function useStockMovements(params: { inventory_item_id?: string; movement_type?: string; per_page?: number; page?: number } = {}) {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.movements(params),
    queryFn: () => inventoryService.getMovements(params),
    enabled: Boolean(params.inventory_item_id),
    staleTime: 30 * 1000,
  });
}

export function useWarehouses() {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEYS.warehouses,
    queryFn: () => inventoryService.listWarehouses(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdjustStockPayload) => inventoryService.adjustStock(payload),
    onSuccess: (_, variables) => {
      // Invalidate general inventory queries
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.all });
      // Invalidate product specific inventory
      if (variables.product_id) {
        queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.product(variables.product_id) });
        queryClient.invalidateQueries({ queryKey: ["admin", "products", variables.product_id] });
      }
      // Invalidate catalog list and dashboard telemetry
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useTransferStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TransferStockPayload) => inventoryService.transferStock(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.all });
      if (variables.product_id) {
        queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEYS.product(variables.product_id) });
        queryClient.invalidateQueries({ queryKey: ["admin", "products", variables.product_id] });
      }
    },
  });
}
