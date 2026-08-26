import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponService, CouponQueryParams } from "@/services/coupon-service";

export const COUPON_QUERY_KEYS = {
  coupons: (params: CouponQueryParams) => ["admin", "coupons", params] as const,
  coupon: (id: string) => ["admin", "coupons", id] as const,
  usage: (id: string, params: { page?: number; per_page?: number }) =>
    ["admin", "coupons", id, "usage", params] as const,
};

export function useCoupons(params: CouponQueryParams = {}) {
  return useQuery({
    queryKey: COUPON_QUERY_KEYS.coupons(params),
    queryFn: () => couponService.getCoupons(params),
    staleTime: 30 * 1000,
  });
}

export function useCoupon(id: string) {
  return useQuery({
    queryKey: COUPON_QUERY_KEYS.coupon(id),
    queryFn: () => couponService.getCoupon(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCouponUsage(id: string, params: { page?: number; per_page?: number } = {}) {
  return useQuery({
    queryKey: COUPON_QUERY_KEYS.usage(id, params),
    queryFn: () => couponService.getCouponUsage(id, params),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
  });
}
