import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, OrderQueryParams } from "@/services/order-service";

export const ORDER_QUERY_KEYS = {
  orders: (params: OrderQueryParams) => ["admin", "orders", params] as const,
  order: (id: string) => ["admin", "orders", id] as const,
  timeline: (id: string) => ["admin", "orders", id, "timeline"] as const,
};

export function useOrders(params: OrderQueryParams = {}) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.orders(params),
    queryFn: () => orderService.getOrders(params),
    staleTime: 30 * 1000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.order(id),
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useOrderTimeline(id: string) {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.timeline(id),
    queryFn: () => orderService.getTimeline(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, comment }: { id: string; status: string; comment?: string }) =>
      orderService.updateStatus(id, status, comment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.order(variables.id) });
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.timeline(variables.id) });
    },
  });
}

export function useAddOrderNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => orderService.addNotes(id, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.order(variables.id) });
    },
  });
}
