import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "@/lib/api/client";
import { cartService, CartData, CartItem } from "@/services/cart-service";
import { catalogService, ProductItem, ProductDetail, ProductVariant } from "@/services/catalog-service";
import { checkoutService, CheckoutValidationResult, ProcessCheckoutPayload } from "@/services/checkout-service";
import { orderService, OrderListItem, OrderDetail } from "@/services/order-service";
import { paymentService, PaymentItem } from "@/services/payment-service";
import { inventoryService, InventoryItem } from "@/services/inventory-service";
import { couponService, CouponItem } from "@/services/coupon-service";
import { shippingService, ShipmentItem } from "@/services/shipping-service";
import { invoiceService, InvoiceItem } from "@/services/invoice-service";
import { customerService, CustomerAddress } from "@/services/customer-service";
import { healthService, AdminSystemHealthData } from "@/services/health-service";
import { settingsService, SettingItem } from "@/services/settings-service";
import { authService, AuthResponseData } from "@/services/auth-service";
import { formatCurrency, getCurrencySymbol } from "@/lib/utils";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe("API Contract & Data Integrity Integration Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("01. verifies catalog products contract matches Laravel ProductResource", async () => {
    const mockProductPayload = {
      id: "prod-001",
      name: "Neural Headset Pro",
      slug: "neural-headset-pro",
      sku: "NHP-001",
      base_price: "299.99",
      compare_at_price: "349.99",
      cost_price: null,
      currency_code: "USD",
      status: "active",
      visibility: "visible",
      is_featured: true,
      is_active: true,
      avg_rating: "4.8",
      review_count: 24,
      total_sold: 150,
      category: { id: "cat-1", name: "Wearables", slug: "wearables" },
      brand: { id: "br-1", name: "NeuroTech", slug: "neurotech", logo_url: null },
      primary_image: { id: "img-1", url: "https://example.com/img.jpg", alt_text: "Front" },
      created_at: "2026-09-06T00:00:00Z",
      updated_at: "2026-09-06T00:00:00Z",
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Products retrieved",
        data: [mockProductPayload],
        meta: { current_page: 1, per_page: 20, total: 1 },
      },
    });

    const result = await catalogService.getProducts();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("prod-001");
    expect(result.data[0].sku).toBe("NHP-001");
    expect(result.data[0].status).toBe("active");
    expect(result.meta?.total).toBe(1);
  });

  it("02. verifies product detail contract with nested variants and images", async () => {
    const mockDetail: ProductDetail = {
      id: "prod-001",
      name: "Neural Headset Pro",
      slug: "neural-headset-pro",
      sku: "NHP-001",
      base_price: 299.99,
      status: "active",
      is_active: true,
      is_featured: true,
      created_at: "2026-09-06T00:00:00Z",
      updated_at: "2026-09-06T00:00:00Z",
      variants: [
        {
          id: "var-001",
          sku: "NHP-001-BLK",
          price: 299.99,
          is_active: true,
          stock_quantity: 45,
        },
      ],
      images: [
        {
          id: "img-001",
          url: "https://example.com/front.webp",
          is_primary: true,
          sort_order: 1,
        },
      ],
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Product retrieved",
        data: mockDetail,
      },
    });

    const result = await catalogService.getProduct("prod-001");
    expect(result.variants).toHaveLength(1);
    expect(result.variants?.[0].sku).toBe("NHP-001-BLK");
    expect(result.images?.[0].is_primary).toBe(true);
  });

  it("03. verifies inventory item stock calculation contract", async () => {
    const mockInventory: InventoryItem = {
      id: "inv-001",
      product_id: "prod-001",
      warehouse_id: "wh-001",
      quantity_on_hand: 100,
      quantity_reserved: 15,
      quantity_available: 85,
      reorder_point: 10,
      reorder_quantity: 50,
      is_low_stock: false,
      is_out_of_stock: false,
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Inventory item retrieved",
        data: mockInventory,
      },
    });

    const item = await inventoryService.getInventoryItem("inv-001");
    expect(item.quantity_available).toBe(item.quantity_on_hand - item.quantity_reserved);
    expect(item.is_low_stock).toBe(false);
  });

  it("04. verifies shopping cart response contract with line_total and monetary fields", async () => {
    const mockCart: CartData = {
      id: "cart-001",
      user_id: "usr-001",
      items_count: 2,
      subtotal: 200.0,
      discount_total: 20.0,
      tax_total: 15.0,
      shipping_total: 10.0,
      grand_total: 205.0,
      coupon_code: "SAVE10",
      items: [
        {
          id: "item-001",
          cart_id: "cart-001",
          product_id: "prod-001",
          quantity: 2,
          unit_price: 100.0,
          line_total: "200.00",
          product: {
            id: "prod-001",
            name: "Neural Chip",
            slug: "neural-chip",
            sku: "NC-001",
            base_price: 100.0,
            status: "active",
            is_active: true,
            is_featured: false,
            created_at: "2026-09-06T00:00:00Z",
            updated_at: "2026-09-06T00:00:00Z",
          },
          created_at: "2026-09-06T00:00:00Z",
          updated_at: "2026-09-06T00:00:00Z",
        },
      ],
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Cart fetched",
        data: mockCart,
      },
    });

    const cart = await cartService.getCart();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].line_total).toBe("200.00");
    expect(cart.grand_total).toBe(205.0);
    expect(cart.coupon_code).toBe("SAVE10");
  });

  it("05. verifies coupon contract and type enumeration", async () => {
    const mockCoupon: CouponItem = {
      id: "coup-001",
      code: "WELCOME20",
      name: "Welcome Discount",
      type: "percentage",
      value: 20,
      min_order_amount: 50,
      times_used: 12,
      usage_limit: 100,
      is_active: true,
      is_valid: true,
      created_at: "2026-09-06T00:00:00Z",
      updated_at: "2026-09-06T00:00:00Z",
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Coupon retrieved",
        data: mockCoupon,
      },
    });

    const coupon = await couponService.getCoupon("coup-001");
    expect(coupon.code).toBe("WELCOME20");
    expect(coupon.type).toBe("percentage");
    expect(coupon.is_valid).toBe(true);
  });

  it("06. verifies checkout processing contract and returned order snapshot", async () => {
    const mockCheckoutResult = {
      order: {
        id: "ord-001",
        order_number: "ORD-20260906-001",
        status: "paid" as const,
        status_label: "Paid",
        currency_code: "USD",
        subtotal: 100.0,
        tax_amount: 8.0,
        shipping_amount: 12.0,
        discount_amount: 0.0,
        total_amount: 120.0,
        item_count: 1,
        created_at: "2026-09-06T00:00:00Z",
        updated_at: "2026-09-06T00:00:00Z",
      },
      payment: {
        transaction_id: "tx-stripe-001",
        status: "succeeded" as const,
        payment_method: "stripe",
      },
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Order placed",
        data: mockCheckoutResult,
      },
    });

    const payload: ProcessCheckoutPayload = {
      shipping_address: {
        first_name: "John",
        last_name: "Doe",
        address_line_1: "123 High St",
        city: "Lagos",
        postal_code: "100001",
        country_code: "NG",
      },
      billing_address: {
        first_name: "John",
        last_name: "Doe",
        address_line_1: "123 High St",
        city: "Lagos",
        postal_code: "100001",
        country_code: "NG",
      },
      payment_method: "stripe",
    };

    const result = await checkoutService.processCheckout(payload);
    expect(result.order.order_number).toBe("ORD-20260906-001");
    expect(result.payment.status).toBe("succeeded");
  });

  it("07. verifies order detail contract with status history and item lines", async () => {
    const mockOrderDetail: OrderDetail = {
      id: "ord-001",
      order_number: "ORD-20260906-001",
      status: "delivered",
      status_label: "Delivered",
      currency_code: "USD",
      subtotal: 150.0,
      tax_amount: 12.0,
      shipping_amount: 10.0,
      discount_amount: 0.0,
      total_amount: 172.0,
      item_count: 1,
      items: [
        {
          id: "oi-001",
          product_name: "Neural Interface",
          product_sku: "NI-001",
          unit_price: 150.0,
          quantity: 1,
          line_total: 150.0,
        },
      ],
      status_history: [
        {
          id: "sh-001",
          to_status: "delivered",
          comment: "Package received",
          created_at: "2026-09-06T00:00:00Z",
        },
      ],
      created_at: "2026-09-06T00:00:00Z",
      updated_at: "2026-09-06T00:00:00Z",
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Order retrieved",
        data: mockOrderDetail,
      },
    });

    const order = await orderService.getOrder("ord-001");
    expect(order.status).toBe("delivered");
    expect(order.items?.[0].product_sku).toBe("NI-001");
    expect(order.status_history?.[0].to_status).toBe("delivered");
  });

  it("08. verifies shipment contract with tracking events", async () => {
    const mockShipment: ShipmentItem = {
      id: "shp-001",
      order_id: "ord-001",
      warehouse_id: "wh-001",
      carrier: "DHL Express",
      service_level: "express",
      tracking_number: "DHL-987654321",
      tracking_url: "https://dhl.com/track/987654321",
      status: "in_transit",
      shipped_at: "2026-09-06T00:00:00Z",
      estimated_delivery: "2026-09-08T00:00:00Z",
      delivered_at: null,
      weight: 1.5,
      cost: 15.0,
      label_url: null,
      tracking_events: [
        {
          id: "evt-001",
          status: "in_transit",
          location: "Frankfurt Hub",
          description: "Departed sorting facility",
          occurred_at: "2026-09-06T04:00:00Z",
        },
      ],
      created_at: "2026-09-06T00:00:00Z",
      updated_at: "2026-09-06T00:00:00Z",
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Shipment retrieved",
        data: mockShipment,
      },
    });

    const shipment = await shippingService.getShipment("shp-001");
    expect(shipment.tracking_number).toBe("DHL-987654321");
    expect(shipment.tracking_events?.[0].location).toBe("Frankfurt Hub");
  });

  it("09. verifies invoice contract and status serialization", async () => {
    const mockInvoice: InvoiceItem = {
      id: "inv-001",
      order_id: "ord-001",
      invoice_number: "INV-20260906-001",
      status: "paid",
      status_label: "Paid",
      subtotal: 100.0,
      tax_amount: 8.0,
      total_amount: 108.0,
      currency_code: "USD",
      issued_at: "2026-09-06T00:00:00Z",
      paid_at: "2026-09-06T00:00:00Z",
      created_at: "2026-09-06T00:00:00Z",
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Invoice retrieved",
        data: mockInvoice,
      },
    });

    const invoice = await invoiceService.getInvoice("inv-001");
    expect(invoice.invoice_number).toBe("INV-20260906-001");
    expect(invoice.status).toBe("paid");
  });

  it("10. verifies customer profile normalization from auth API", async () => {
    const mockRawMe = {
      id: "usr-001",
      first_name: "Ada",
      last_name: "Lovelace",
      email: "ada@neurocommerce.ai",
      user_type: "customer",
      is_active: true,
      created_at: "2026-09-06T00:00:00Z",
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Profile retrieved",
        data: mockRawMe,
      },
    });

    const user = await authService.getMe();
    expect(user.first_name).toBe("Ada");
    expect(user.full_name).toBe("Ada Lovelace");
    expect(user.role).toBe("customer");
    expect(user.is_active).toBe(true);
  });

  it("11. verifies admin system health authoritative response contract", async () => {
    const mockHealth: AdminSystemHealthData = {
      status: "healthy",
      checked_at: "2026-09-06T00:00:00Z",
      application: {
        status: "healthy",
        name: "NeuroCommerce AI",
        version: "1.0.0",
        environment: "production",
        debug_mode: false,
        laravel_version: "12.x",
        php_version: "8.4",
        timezone: "UTC",
        locale: "en",
      },
      database: {
        status: "healthy",
        connection: "mysql",
        database_name: "neurocommerce_ai",
        response_time_ms: 1.2,
      },
      cache: {
        status: "healthy",
        driver: "redis",
        response_time_ms: 0.8,
      },
      queue: {
        status: "configured",
        driver: "redis",
        worker_status: "managed externally",
      },
      storage: {
        status: "healthy",
        disk: "local",
        writable: true,
      },
      external_services: [
        {
          name: "AI Recommendation Engine",
          status: "healthy",
          provider: "FastApiAIProvider",
        },
      ],
      security_warnings: [],
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "System health retrieved",
        data: mockHealth,
      },
    });

    const health = await healthService.getAdminSystemHealth();
    expect(health.status).toBe("healthy");
    expect(health.database.status).toBe("healthy");
    expect(health.cache.driver).toBe("redis");
    expect(health.security_warnings).toHaveLength(0);
  });

  it("12. verifies admin settings grouped normalization contract", async () => {
    const mockGroupedSettings = {
      general: {
        site_name: {
          id: "set-1",
          value: "NeuroCommerce AI",
          type: "string",
          is_public: true,
          description: "Store name",
        },
      },
      security: {
        two_factor_auth: {
          id: "set-2",
          value: true,
          type: "boolean",
          is_public: false,
          description: "Enforce 2FA",
        },
      },
    };

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: "Settings retrieved",
        data: mockGroupedSettings,
      },
    });

    const settings = await settingsService.getAllGrouped();
    expect(settings.general).toHaveLength(1);
    expect(settings.general[0].key).toBe("site_name");
    expect(settings.general[0].value).toBe("NeuroCommerce AI");
    expect(settings.security[0].value).toBe(true);
  });

  it("13. verifies formatCurrency utility parses both number and numeric strings safely", () => {
    // Numeric value
    const formattedNum = formatCurrency(299.99, "USD");
    expect(formattedNum).toContain("299.99");

    // String value from Laravel Decimal / Price fields
    const formattedStr = formatCurrency("149.50", "USD");
    expect(formattedStr).toContain("149.50");

    // Null or undefined fallback
    const formattedNull = formatCurrency(null, "USD");
    expect(formattedNull).toContain("0.00");

    // Currency symbols
    expect(getCurrencySymbol("USD")).toBe("$");
    expect(getCurrencySymbol("NGN")).toBe("₦");
    expect(getCurrencySymbol("EUR")).toBe("€");
  });
});