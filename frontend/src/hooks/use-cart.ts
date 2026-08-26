import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartService } from "@/services/cart-service";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

export const CART_QUERY_KEYS = {
  cart: ["cart"] as const,
};

export function useCart() {
  const { setItemCount } = useCartStore();

  return useQuery({
    queryKey: CART_QUERY_KEYS.cart,
    queryFn: async () => {
      const data = await cartService.getCart();
      if (data?.items_count !== undefined) {
        setItemCount(data.items_count);
      }
      return data;
    },
    staleTime: 30 * 1000,
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const { setItemCount } = useCartStore();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
      toast.success("Shopping bag updated.");
    },
    onError: () => {
      toast.error("Failed to update cart quantity.");
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
      toast.success("Item removed from shopping bag.");
    },
    onError: () => {
      toast.error("Failed to remove item.");
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { setItemCount } = useCartStore();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      setItemCount(0);
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
      toast.success("Shopping bag cleared.");
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => cartService.applyCoupon(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
      toast.success("Coupon code applied successfully!");
    },
    onError: () => {
      toast.error("Invalid or expired coupon code.");
    },
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
      toast.success("Coupon code removed.");
    },
  });
}
