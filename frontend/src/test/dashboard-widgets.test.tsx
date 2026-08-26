import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopProductsCard } from "@/components/dashboard/top-products-card";
import { LowStockWidget } from "@/components/dashboard/low-stock-widget";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { TopProduct, LowStockItem, RecentOrder } from "@/services/dashboard-service";

const mockTopProducts: TopProduct[] = [
  {
    id: "p1",
    name: "Neural Headset X1",
    sku: "NH-X1",
    price: 349.99,
    total_sold: 140,
    stock_quantity: 25,
    category: { id: "c1", name: "Audio" },
  },
];

const mockLowStock: LowStockItem[] = [
  {
    id: "p2",
    name: "Synapse Smart Watch",
    sku: "SSW-02",
    stock_quantity: 2,
    stock_status: "low_stock",
    category: { id: "c2", name: "Wearables" },
  },
];

const mockRecentOrders: RecentOrder[] = [
  {
    id: "ord-1",
    order_number: "ORD-2026-9901",
    status: "processing",
    total_amount: 499.5,
    created_at: "2026-08-21T10:00:00Z",
    user: {
      id: "u1",
      first_name: "Alice",
      last_name: "Smith",
      email: "alice@example.com",
    },
    items: [
      {
        id: "item-1",
        product_name: "Neural Headset X1",
        quantity: 1,
        unit_price: 349.99,
        total_price: 349.99,
      },
    ],
  },
];

describe("Dashboard Widgets Component Suite", () => {
  it("renders Top Products ranked list properly", () => {
    render(<TopProductsCard products={mockTopProducts} isLoading={false} isError={false} />);

    expect(screen.getByText("Neural Headset X1")).toBeInTheDocument();
    expect(screen.getByText("140")).toBeInTheDocument();
    expect(screen.getByText(/Audio • \$349\.99/i)).toBeInTheDocument();
  });

  it("renders Low Stock alerts with warning badge", () => {
    render(<LowStockWidget items={mockLowStock} isLoading={false} isError={false} />);

    expect(screen.getByText("Synapse Smart Watch")).toBeInTheDocument();
    expect(screen.getByText("2 left")).toBeInTheDocument();
  });

  it("renders Recent Orders table with order numbers and status badges", () => {
    render(<RecentOrdersTable orders={mockRecentOrders} isLoading={false} isError={false} />);

    expect(screen.getByText("ORD-2026-9901")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("$499.50")).toBeInTheDocument();
    expect(screen.getByText("Processing")).toBeInTheDocument();
  });
});
