import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  paymentService,
  PaymentQueryParams,
  ProcessRefundPayload,
} from "@/services/payment-service";

export const PAYMENT_QUERY_KEYS = {
  all: (params: PaymentQueryParams) => ["admin", "payments", params] as const,
  detail: (id: string) => ["admin", "payments", id] as const,
};

export function usePayments(params: PaymentQueryParams = {}) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.all(params),
    queryFn: () => paymentService.getPayments(params),
    staleTime: 30 * 1000,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.detail(id),
    queryFn: () => paymentService.getPayment(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useRefundPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProcessRefundPayload }) =>
      paymentService.processRefund(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "payments"] });
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
}