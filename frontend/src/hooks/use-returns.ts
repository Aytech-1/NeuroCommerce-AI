import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { returnService, ReturnQueryParams, ProcessRefundPayload, RefundItem } from "@/services/return-service";

export const REFUND_KEYS = {
  all: ["refunds"] as const,
  lists: () => [...REFUND_KEYS.all, "list"] as const,
  list: (params?: ReturnQueryParams) => [...REFUND_KEYS.lists(), params] as const,
  details: () => [...REFUND_KEYS.all, "detail"] as const,
  detail: (id: string) => [...REFUND_KEYS.details(), id] as const,
};

export function useRefunds(params?: ReturnQueryParams) {
  return useQuery({
    queryKey: REFUND_KEYS.list(params),
    queryFn: () => returnService.getRefunds(params),
  });
}

export function useRefund(id: string) {
  return useQuery({
    queryKey: REFUND_KEYS.detail(id),
    queryFn: () => returnService.getRefund(id),
    enabled: Boolean(id),
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, payload }: { paymentId: string; payload: ProcessRefundPayload }) =>
      returnService.processRefund(paymentId, payload),
    onSuccess: (data: RefundItem) => {
      queryClient.invalidateQueries({ queryKey: REFUND_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.setQueryData(REFUND_KEYS.detail(data.id), data);
    },
  });
}
