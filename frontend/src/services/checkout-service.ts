import { apiClient } from "@/lib/api/client";
import { ApiResponse } from "@/types/api";
import { OrderDetail } from "./order-service";

export interface AddressPayload {
  first_name: string;
  last_name: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state_province?: string | null;
  postal_code: string;
  country_code: string;
  phone?: string | null;
}

export interface ProcessCheckoutPayload {
  billing_address: AddressPayload;
  shipping_address: AddressPayload;
  shipping_method?: string;
  payment_method: "stripe" | "paypal" | "cash_on_delivery";
  payment_token?: string | null;
  notes?: string | null;
  coupon_code?: string | null;
  guest_email?: string | null;
  guest_first_name?: string | null;
  guest_last_name?: string | null;
  guest_phone?: string | null;
  session_id?: string;
}

export interface CheckoutValidationResult {
  is_valid: boolean;
  item_count: number;
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency_code: string;
}

export interface ShippingRate {
  id: string;
  name: string;
  carrier: string;
  cost: number;
  estimated_days: string;
}

export interface TaxCalculationResult {
  tax_rate: number;
  tax_amount: number;
  jurisdiction: string;
}

export interface CheckoutPaymentResult {
  transaction_id: string;
  status: "succeeded" | "pending" | "failed";
  payment_method: string;
}

export interface CheckoutResponseData {
  order: OrderDetail;
  payment: CheckoutPaymentResult;
}

export const checkoutService = {
  async validateCheckout(data: { coupon_code?: string; session_id?: string } = {}): Promise<CheckoutValidationResult> {
    const response = await apiClient.post<ApiResponse<CheckoutValidationResult>>("/checkout/validate", data);
    return response.data.data;
  },

  async getShippingRates(): Promise<ShippingRate[]> {
    const response = await apiClient.get<ApiResponse<ShippingRate[]>>("/checkout/shipping-rates");
    return response.data.data;
  },

  async getTax(countryCode: string = "US"): Promise<TaxCalculationResult> {
    const response = await apiClient.get<ApiResponse<TaxCalculationResult>>("/checkout/tax", {
      params: { country_code: countryCode },
    });
    return response.data.data;
  },

  async processCheckout(data: ProcessCheckoutPayload): Promise<CheckoutResponseData> {
    const response = await apiClient.post<ApiResponse<CheckoutResponseData>>("/checkout", data);
    return response.data.data;
  },
};
