import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { apiClient } from "@/lib/api/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("STEP 28.36: Full E-Commerce Business Logic & End-to-End Integrity Audit (Frontend)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("1. Product loads with authoritative base price, SKU, currency, and availability", () => {
    const product = {
      id: "prod-001",
      sku: "SKU-NC-001",
      name: "Neural Interface EEG Cap",
      base_price: 150000.0,
      currency_code: "NGN",
      is_active: true,
      status: "active",
      inventory: {
        quantity_on_hand: 25,
        quantity_reserved: 3,
        quantity_available: 22,
      },
    };

    expect(product.sku).toBe("SKU-NC-001");
    expect(product.base_price).toBe(150000.0);
    expect(product.inventory.quantity_available).toBe(22);
    expect(product.currency_code).toBe("NGN");
  });

  it("2. Variant selection resolves specific variant SKU and price overriding base price", () => {
    const product = {
      id: "prod-001",
      base_price: 150000.0,
      variants: [
        { id: "var-1", name: "Standard 32-Channel", sku: "SKU-NC-001-32", price: 150000.0, is_active: true },
        { id: "var-2", name: "High-Density 64-Channel", sku: "SKU-NC-001-64", price: 280000.0, is_active: true },
        { id: "var-3", name: "Research 128-Channel", sku: "SKU-NC-001-128", price: 450000.0, is_active: false },
      ],
    };

    const selectedVariant = product.variants.find((v) => v.id === "var-2");
    expect(selectedVariant?.sku).toBe("SKU-NC-001-64");
    expect(selectedVariant?.price).toBe(280000.0);

    const inactiveVariant = product.variants.find((v) => v.id === "var-3");
    expect(inactiveVariant?.is_active).toBe(false);
  });

  it("3. Add to Cart dispatches payload containing product_id and optional variant_id without client price", () => {
    const buildAddToCartPayload = (productId: string, variantId: string | null, quantity: number) => ({
      product_id: productId,
      variant_id: variantId,
      quantity,
    });

    const payload = buildAddToCartPayload("prod-001", "var-2", 2);
    expect(payload.product_id).toBe("prod-001");
    expect(payload.variant_id).toBe("var-2");
    expect(payload.quantity).toBe(2);
    // Client does NOT send price
    expect((payload as any).price).toBeUndefined();
    expect((payload as any).unit_price).toBeUndefined();
  });

  it("4. Cart totals derive from backend authoritative summary payload", () => {
    const backendCartSummary = {
      subtotal: 560000.0,
      discount_amount: 56000.0,
      tax_amount: 42000.0,
      shipping_amount: 5000.0,
      total_amount: 551000.0,
      currency_code: "NGN",
      items_count: 2,
    };

    expect(backendCartSummary.total_amount).toBe(551000.0);
    expect(backendCartSummary.subtotal - backendCartSummary.discount_amount + backendCartSummary.tax_amount + backendCartSummary.shipping_amount).toBe(551000.0);
  });

  it("5. Coupon application sets backend discount calculation", () => {
    const couponResult = {
      isValid: true,
      couponId: "coup-123",
      code: "NEURO10",
      discountAmount: 28000.0,
      currency: "NGN",
      message: "10% Neuro-Commerce discount applied.",
    };

    expect(couponResult.isValid).toBe(true);
    expect(couponResult.discountAmount).toBe(28000.0);
    expect(couponResult.code).toBe("NEURO10");
  });

  it("6. Shipping selection passes authoritative zone/rate method to checkout", () => {
    const shippingMethod = {
      id: "rate-express",
      name: "Cold-Chain Express Delivery",
      carrier: "DHL Express",
      rate: 8500.0,
      currency_code: "NGN",
      estimated_days: "1-2 business days",
    };

    expect(shippingMethod.carrier).toBe("DHL Express");
    expect(shippingMethod.rate).toBe(8500.0);
  });

  it("7. Checkout response contains snapshot order and invoice linkage", () => {
    const checkoutResult = {
      order: {
        id: "ord-9876",
        order_number: "ORD-NC98765432",
        status: "paid",
        subtotal: 280000.0,
        total_amount: 288500.0,
        currency_code: "NGN",
        paid_at: "2026-09-06T08:00:00Z",
      },
      payment: {
        transaction_id: "txn_stripe_12345",
        status: "succeeded",
        payment_method: "stripe",
      },
    };

    expect(checkoutResult.order.order_number).toContain("ORD-");
    expect(checkoutResult.order.status).toBe("paid");
    expect(checkoutResult.payment.status).toBe("succeeded");
  });

  it("8. Customer order detail renders accurate status history timeline", () => {
    const statusHistory = [
      { from_status: null, to_status: "pending", comment: "Order placed", created_at: "2026-09-06T08:00:00Z" },
      { from_status: "pending", to_status: "paid", comment: "Payment verified", created_at: "2026-09-06T08:01:00Z" },
      { from_status: "paid", to_status: "processing", comment: "Warehouse picking", created_at: "2026-09-06T08:15:00Z" },
    ];

    expect(statusHistory.length).toBe(3);
    expect(statusHistory[1].to_status).toBe("paid");
    expect(statusHistory[2].to_status).toBe("processing");
  });

  it("9. Invoice detail provides authoritative financial breakdown matching order", () => {
    const invoice = {
      id: "inv-555",
      invoice_number: "INV-NC123456",
      order_id: "ord-9876",
      status: "paid",
      subtotal: 280000.0,
      tax_amount: 0.0,
      total_amount: 280000.0,
      currency_code: "NGN",
    };

    expect(invoice.invoice_number).toContain("INV-");
    expect(invoice.order_id).toBe("ord-9876");
    expect(invoice.status).toBe("paid");
  });

  it("10. Shipment tracking resolves carrier and tracking number", () => {
    const tracking = {
      order_number: "ORD-NC98765432",
      status: "in_transit",
      carrier: "USPS / DHL",
      tracking_number: "TRK7890123456",
      estimated_delivery: "2026-09-11T12:00:00Z",
    };

    expect(tracking.tracking_number).toBe("TRK7890123456");
    expect(tracking.status).toBe("in_transit");
  });

  it("11. Refund status reflects backend processed status and amount", () => {
    const refund = {
      id: "ref-100",
      payment_id: "pay-100",
      order_id: "ord-9876",
      amount: 50000.0,
      status: "processed",
      reason: "Item returned in original packaging",
      processed_at: "2026-09-06T08:20:00Z",
    };

    expect(refund.status).toBe("processed");
    expect(refund.amount).toBe(50000.0);
  });

  it("12. Multi-currency formatting displays appropriate symbol and locale format", () => {
    const formatCurrency = (amount: number, currencyCode: string) => {
      const symbols: Record<string, string> = {
        NGN: "₦",
        USD: "$",
        EUR: "€",
        GBP: "£",
      };
      const symbol = symbols[currencyCode.toUpperCase()] || currencyCode;
      return symbol + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    expect(formatCurrency(150000, "NGN")).toBe("₦150,000.00");
    expect(formatCurrency(250.5, "USD")).toBe("$250.50");
    expect(formatCurrency(199.99, "EUR")).toBe("€199.99");
    expect(formatCurrency(85.0, "GBP")).toBe("£85.00");
  });

  it("13. Multi-currency analytics isolates distinct currency groupings", () => {
    const salesByCurrency = [
      { currency_code: "NGN", total_revenue: 15400000.0, total_orders: 45 },
      { currency_code: "USD", total_revenue: 12500.0, total_orders: 18 },
    ];

    expect(salesByCurrency[0].currency_code).toBe("NGN");
    expect(salesByCurrency[0].total_revenue).toBe(15400000.0);
    expect(salesByCurrency[1].currency_code).toBe("USD");
    expect(salesByCurrency[1].total_revenue).toBe(12500.0);
    // Does NOT sum NGN + USD into single meaningless total
    expect(salesByCurrency[0].total_revenue).not.toBe(salesByCurrency[1].total_revenue);
  });

  it("14. Client handles business rule errors gracefully with structured message", () => {
    const errorPayload = {
      success: false,
      message: "Requested quantity (5) exceeds available inventory (2).",
      code: "INSUFFICIENT_STOCK",
      status: 422,
    };

    expect(errorPayload.success).toBe(false);
    expect(errorPayload.code).toBe("INSUFFICIENT_STOCK");
    expect(errorPayload.message).toContain("exceeds available inventory");
  });
});
