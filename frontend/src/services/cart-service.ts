import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { ProductItem, ProductVariant } from "./catalog-service";

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product: ProductItem;
  variant?: ProductVariant | null;
  created_at: string;
  updated_at: string;
}

export interface CartData {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  items: CartItem[];
  items_count: number;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  shipping_total: number;
  grand_total: number;
  coupon_code?: string | null;
}

export const cartService = {
  async getCart(): Promise<CartData> {
    const response = await apiClient.get<ApiResponse<CartData>>("/cart");
    return response.data.data;
  },

  async addItem(productId: string, quantity = 1, variantId?: string): Promise<CartItem> {
    const response = await apiClient.post<ApiResponse<CartItem>>("/cart/items", {
      product_id: productId,
      quantity,
      variant_id: variantId,
    });
    return response.data.data;
  },

  async updateItem(itemId: string, quantity: number): Promise<CartItem> {
    const response = await apiClient.put<ApiResponse<CartItem>>(`/cart/items/${itemId}`, {
      quantity,
    });
    return response.data.data;
  },

  async removeItem(itemId: string): Promise<void> {
    await apiClient.delete(`/cart/items/${itemId}`);
  },

  async clearCart(): Promise<void> {
    await apiClient.delete("/cart");
  },

  async applyCoupon(code: string): Promise<CartData> {
    const response = await apiClient.post<ApiResponse<CartData>>("/cart/coupon", { code });
    return response.data.data;
  },

  async removeCoupon(): Promise<CartData> {
    const response = await apiClient.delete<ApiResponse<CartData>>("/cart/coupon");
    return response.data.data;
  },
};
