import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginationMeta, User } from "@/types/api";
import { OrderDetail, OrderListItem } from "./order-service";
import { ProductItem, ProductVariant } from "./catalog-service";
import { ReviewItem } from "./review-service";

export interface CustomerAddress {
  id: string;
  first_name: string;
  last_name: string;
  company?: string | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state?: string | null;
  postal_code: string;
  country_code: string;
  phone?: string | null;
  is_default: boolean;
  type?: "shipping" | "billing" | "both";
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  variant_id?: string | null;
  product: ProductItem;
  variant?: ProductVariant | null;
  created_at: string;
}

export interface WishlistData {
  id: string;
  user_id: string;
  items: WishlistItem[];
}

export interface CustomerNotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  channel: string;
  read_at?: string | null;
  data?: Record<string, unknown> | null;
  created_at: string;
}

export interface NotificationPreferenceItem {
  id: string;
  user_id: string;
  channel: "email" | "sms" | "push";
  category: "order_updates" | "promotions" | "security_alerts" | "newsletter";
  is_enabled: boolean;
}

export const customerService = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>("/auth/me", data);
    return response.data.data;
  },

  async changePassword(data: { current_password?: string; password: string; password_confirmation: string }): Promise<void> {
    await apiClient.post("/auth/change-password", data);
  },

  async getAddresses(): Promise<CustomerAddress[]> {
    const response = await apiClient.get<ApiResponse<CustomerAddress[]>>("/addresses");
    return response.data.data;
  },

  async createAddress(data: Omit<CustomerAddress, "id" | "created_at" | "updated_at">): Promise<CustomerAddress> {
    const response = await apiClient.post<ApiResponse<CustomerAddress>>("/addresses", data);
    return response.data.data;
  },

  async updateAddress(id: string, data: Partial<CustomerAddress>): Promise<CustomerAddress> {
    const response = await apiClient.put<ApiResponse<CustomerAddress>>(`/addresses/${id}`, data);
    return response.data.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await apiClient.delete(`/addresses/${id}`);
  },

  async setDefaultAddress(id: string): Promise<void> {
    await apiClient.post(`/addresses/${id}/default`);
  },

  async getCustomerOrders(params: { page?: number; per_page?: number; status?: string } = {}): Promise<{ data: OrderListItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<OrderListItem[]>>("/customer/orders", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getCustomerOrder(id: string): Promise<OrderDetail> {
    const response = await apiClient.get<ApiResponse<OrderDetail>>(`/customer/orders/${id}`);
    return response.data.data;
  },

  async cancelCustomerOrder(id: string, reason: string): Promise<OrderDetail> {
    const response = await apiClient.post<ApiResponse<OrderDetail>>(`/customer/orders/${id}/cancel`, { reason });
    return response.data.data;
  },

  async getWishlist(): Promise<WishlistData> {
    const response = await apiClient.get<ApiResponse<WishlistData>>("/customer/wishlist");
    return response.data.data;
  },

  async addToWishlist(productId: string): Promise<WishlistItem> {
    const response = await apiClient.post<ApiResponse<WishlistItem>>("/customer/wishlist", { product_id: productId });
    return response.data.data;
  },

  async removeFromWishlist(productId: string): Promise<void> {
    await apiClient.delete(`/customer/wishlist/${productId}`);
  },

  async moveWishlistToCart(productId: string): Promise<void> {
    await apiClient.post(`/customer/wishlist/${productId}/move-to-cart`);
  },

  async getCustomerReviews(params: { page?: number; per_page?: number } = {}): Promise<{ data: ReviewItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<ReviewItem[]>>("/customer/reviews", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getNotifications(params: { page?: number; per_page?: number; unread_only?: boolean } = {}): Promise<{ data: CustomerNotificationItem[]; meta?: PaginationMeta }> {
    const response = await apiClient.get<ApiResponse<CustomerNotificationItem[]>>("/notifications", { params });
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  },

  async getUnreadNotificationCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ unread_count: number }>>("/notifications/unread-count");
    return response.data.data.unread_count;
  },

  async markNotificationRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<void> {
    await apiClient.post("/notifications/mark-all-read");
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async getNotificationPreferences(): Promise<NotificationPreferenceItem[]> {
    const response = await apiClient.get<ApiResponse<NotificationPreferenceItem[]>>("/notifications/preferences");
    return response.data.data;
  },

  async updateNotificationPreferences(preferences: Array<{ channel: string; category: string; is_enabled: boolean }>): Promise<void> {
    await apiClient.put("/notifications/preferences", { preferences });
  },
};
