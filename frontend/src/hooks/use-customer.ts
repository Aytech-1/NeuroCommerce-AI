import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService, CustomerAddress } from "@/services/customer-service";
import { User } from "@/types/api";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

export const CUSTOMER_QUERY_KEYS = {
  profile: ["customer", "profile"] as const,
  addresses: ["customer", "addresses"] as const,
  orders: (params: { page?: number; per_page?: number; status?: string }) =>
    ["customer", "orders", params] as const,
  order: (id: string) => ["customer", "order", id] as const,
  wishlist: ["customer", "wishlist"] as const,
  reviews: (params: { page?: number; per_page?: number }) =>
    ["customer", "reviews", params] as const,
  notifications: (params: { page?: number; per_page?: number; unread_only?: boolean }) =>
    ["customer", "notifications", params] as const,
  unreadCount: ["customer", "notifications", "unread-count"] as const,
  preferences: ["customer", "notifications", "preferences"] as const,
};

export function useCustomerProfile() {
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.profile,
    queryFn: async () => {
      const profile = await customerService.getProfile();
      setUser(profile);
      return profile;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: Partial<User>) => customerService.updateProfile(data),
    onSuccess: (updated) => {
      setUser(updated);
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.profile });
      toast.success("Profile updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update profile.");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password?: string; password: string; password_confirmation: string }) =>
      customerService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully!");
    },
    onError: () => {
      toast.error("Failed to update password. Please verify current credentials.");
    },
  });
}

export function useCustomerAddresses() {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.addresses,
    queryFn: () => customerService.getAddresses(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateCustomerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<CustomerAddress, "id" | "created_at" | "updated_at">) =>
      customerService.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.addresses });
      toast.success("Address added to your address book.");
    },
    onError: () => {
      toast.error("Failed to save address.");
    },
  });
}

export function useUpdateCustomerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerAddress> }) =>
      customerService.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.addresses });
      toast.success("Address updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update address.");
    },
  });
}

export function useDeleteCustomerAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.addresses });
      toast.success("Address deleted.");
    },
    onError: () => {
      toast.error("Failed to delete address.");
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.addresses });
      toast.success("Default address updated.");
    },
  });
}

export function useCustomerOrders(params: { page?: number; per_page?: number; status?: string } = {}) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.orders(params),
    queryFn: () => customerService.getCustomerOrders(params),
    staleTime: 60 * 1000,
  });
}

export function useCustomerOrder(id: string) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.order(id),
    queryFn: () => customerService.getCustomerOrder(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCancelCustomerOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      customerService.cancelCustomerOrder(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.order(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
      toast.success("Order cancellation request processed.");
    },
    onError: () => {
      toast.error("Unable to cancel order. Order may already be in processing.");
    },
  });
}

export function useCustomerWishlist() {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.wishlist,
    queryFn: () => customerService.getWishlist(),
    staleTime: 60 * 1000,
  });
}

export function useMoveWishlistToCart() {
  const queryClient = useQueryClient();
  const incrementCount = useCartStore((state) => state.incrementCount);
  const openCart = useCartStore((state) => state.openCart);

  return useMutation({
    mutationFn: (productId: string) => customerService.moveWishlistToCart(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.wishlist });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      incrementCount(1);
      toast.success("Item moved from wishlist to shopping bag!");
      openCart();
    },
    onError: () => {
      toast.error("Failed to move item to cart.");
    },
  });
}

export function useRemoveWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => customerService.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.wishlist });
      toast.success("Item removed from wishlist.");
    },
  });
}

export function useCustomerReviews(params: { page?: number; per_page?: number } = {}) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.reviews(params),
    queryFn: () => customerService.getCustomerReviews(params),
    staleTime: 60 * 1000,
  });
}

export function useCustomerNotifications(params: { page?: number; per_page?: number; unread_only?: boolean } = {}) {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.notifications(params),
    queryFn: () => customerService.getNotifications(params),
    staleTime: 30 * 1000,
  });
}

export function useCustomerUnreadCount() {
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.unreadCount,
    queryFn: async () => {
      const count = await customerService.getUnreadNotificationCount();
      setUnreadCount(count);
      return count;
    },
    refetchInterval: 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const decrementUnread = useNotificationStore((state) => state.decrementUnread);

  return useMutation({
    mutationFn: (id: string) => customerService.markNotificationRead(id),
    onSuccess: () => {
      decrementUnread();
      queryClient.invalidateQueries({ queryKey: ["customer", "notifications"] });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.unreadCount });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  return useMutation({
    mutationFn: () => customerService.markAllNotificationsRead(),
    onSuccess: () => {
      setUnreadCount(0);
      queryClient.invalidateQueries({ queryKey: ["customer", "notifications"] });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.unreadCount });
      toast.success("All notifications marked as read.");
    },
  });
}

export function useDeleteCustomerNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "notifications"] });
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.unreadCount });
      toast.success("Notification deleted.");
    },
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.preferences,
    queryFn: () => customerService.getNotificationPreferences(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Array<{ channel: string; category: string; is_enabled: boolean }>) =>
      customerService.updateNotificationPreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.preferences });
      toast.success("Notification preferences saved.");
    },
    onError: () => {
      toast.error("Failed to update preferences.");
    },
  });
}
