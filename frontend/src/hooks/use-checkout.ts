import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  checkoutService,
  ProcessCheckoutPayload,
  CheckoutValidationResult,
  ShippingRate,
  TaxCalculationResult,
  CheckoutResponseData,
} from "@/services/checkout-service";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const CHECKOUT_QUERY_KEYS = {
  shippingRates: ["checkout", "shipping-rates"] as const,
  tax: (countryCode: string) => ["checkout", "tax", countryCode] as const,
  validation: (couponCode?: string) => ["checkout", "validation", couponCode] as const,
};

export function useShippingRates() {
  return useQuery<ShippingRate[]>({
    queryKey: CHECKOUT_QUERY_KEYS.shippingRates,
    queryFn: () => checkoutService.getShippingRates(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTaxCalculation(countryCode: string = "US") {
  return useQuery<TaxCalculationResult>({
    queryKey: CHECKOUT_QUERY_KEYS.tax(countryCode),
    queryFn: () => checkoutService.getTax(countryCode),
    staleTime: 5 * 60 * 1000,
  });
}

export function useValidateCheckout() {
  return useMutation({
    mutationFn: (data: { coupon_code?: string; session_id?: string }) =>
      checkoutService.validateCheckout(data),
  });
}

export function useProcessCheckout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setItemCount } = useCartStore();

  return useMutation({
    mutationFn: (payload: ProcessCheckoutPayload) => checkoutService.processCheckout(payload),
    onSuccess: (data) => {
      // 1. Authoritative Cart Clearance
      setItemCount(0);
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      // 2. Synchronize Customer Orders & Dashboards
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer", "profile"] });

      toast.success("Order confirmed successfully!");

      // 3. Save order confirmation snapshot in sessionStorage for confirmation page display
      if (typeof window !== "undefined") {
        sessionStorage.setItem("last_order_confirmation", JSON.stringify(data));
      }

      // 4. Navigate to success confirmation page
      router.push(`/checkout/success?order_id=${data.order.id}&order_number=${data.order.order_number}`);
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Payment processing or checkout placement failed. Please verify your details.";
      toast.error(message);
    },
  });
}
