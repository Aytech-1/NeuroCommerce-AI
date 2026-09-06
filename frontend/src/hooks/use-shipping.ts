import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  shippingService,
  ShipmentFilterParams,
  CreateShipmentPayload,
  UpdateShipmentStatusPayload,
} from "@/services/shipping-service";

export const SHIPPING_QUERY_KEYS = {
  all: ["admin", "shipments"] as const,
  lists: () => [...SHIPPING_QUERY_KEYS.all, "list"] as const,
  list: (params: ShipmentFilterParams) => [...SHIPPING_QUERY_KEYS.lists(), params] as const,
  details: () => [...SHIPPING_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...SHIPPING_QUERY_KEYS.details(), id] as const,
  warehouses: ["admin", "warehouses"] as const,
  shippingMethods: ["admin", "shipping-methods"] as const,
};

export function useShipments(params: ShipmentFilterParams = {}) {
  return useQuery({
    queryKey: SHIPPING_QUERY_KEYS.list(params),
    queryFn: () => shippingService.getShipments(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useShipment(id: string) {
  return useQuery({
    queryKey: SHIPPING_QUERY_KEYS.detail(id),
    queryFn: () => shippingService.getShipment(id),
    enabled: !!id,
  });
}

export function useWarehouses() {
  return useQuery({
    queryKey: SHIPPING_QUERY_KEYS.warehouses,
    queryFn: () => shippingService.getWarehouses(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useShippingMethods() {
  return useQuery({
    queryKey: SHIPPING_QUERY_KEYS.shippingMethods,
    queryFn: () => shippingService.getShippingMethods(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, payload }: { orderId: string; payload: CreateShipmentPayload }) =>
      shippingService.createShipmentForOrder(orderId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: SHIPPING_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "detail", variables.orderId] });
    },
  });
}

export function useUpdateShipmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateShipmentStatusPayload }) =>
      shippingService.updateShipmentStatus(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: SHIPPING_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: SHIPPING_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      if (data.order_id) {
        queryClient.invalidateQueries({ queryKey: ["admin", "orders", "detail", data.order_id] });
      }
    },
  });
}
