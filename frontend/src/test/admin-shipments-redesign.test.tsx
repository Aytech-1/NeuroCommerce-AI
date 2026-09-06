import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import AdminShipmentsPage from "@/app/(admin)/admin/shipments/page";
import ShipmentDetailPage from "@/app/(admin)/admin/shipments/[id]/page";
import { useShipments, useShipment, useWarehouses, useUpdateShipmentStatus } from "@/hooks/use-shipping";
import { ShipmentItem, WarehouseItem } from "@/services/shipping-service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/shipments",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-shipping", () => ({
  useShipments: vi.fn(),
  useShipment: vi.fn(),
  useWarehouses: vi.fn(),
  useUpdateShipmentStatus: vi.fn(),
}));

const mockWarehouses: WarehouseItem[] = [
  {
    id: "wh-1",
    name: "Lagos Central Hub",
    code: "LOS-01",
    contact_email: "logistics-los@neurocommerce.ai",
    contact_phone: "+234 800 123 4567",
    is_active: true,
  },
];

const mockShipmentsList: ShipmentItem[] = [
  {
    id: "ship-1",
    order_id: "ord-1",
    order_number: "ORD-2026-0001",
    warehouse_id: "wh-1",
    warehouse_name: "Lagos Central Hub",
    carrier: "dhl",
    service_level: "express",
    tracking_number: "TRK-DHL-9812401",
    tracking_url: "https://tracking.neurocommerce.local/TRK-DHL-9812401",
    status: "in_transit",
    status_label: "In Transit",
    shipped_at: "2026-08-25T12:00:00Z",
    estimated_delivery: "2026-08-28",
    delivered_at: null,
    weight: 1.5,
    cost: 4500,
    label_url: "https://shipping.neurocommerce.local/labels/TRK-DHL-9812401.pdf",
    created_at: "2026-08-25T09:58:00Z",
    updated_at: "2026-08-25T12:00:00Z",
    order: {
      id: "ord-1",
      order_number: "ORD-2026-0001",
      user_id: "user-1",
      status: "shipped",
      total_amount: 185000,
      currency_code: "NGN",
      user: {
        id: "user-1",
        first_name: "Elena",
        last_name: "Rostova",
        email: "elena@example.com",
      },
      shipping_address: {
        address_line_1: "742 Evergreen Terrace",
        city: "Ikeja",
        state: "Lagos",
        postal_code: "100001",
        country_code: "NG",
      },
    },
    warehouse: {
      id: "wh-1",
      name: "Lagos Central Hub",
      code: "LOS-01",
      contact_email: "logistics-los@neurocommerce.ai",
      contact_phone: "+234 800 123 4567",
    },
  },
  {
    id: "ship-2",
    order_id: "ord-2",
    order_number: "ORD-2026-0002",
    warehouse_id: "wh-1",
    warehouse_name: "Lagos Central Hub",
    carrier: "fedex",
    service_level: "standard",
    tracking_number: "TRK-FDX-7712390",
    tracking_url: "https://tracking.neurocommerce.local/TRK-FDX-7712390",
    status: "delivered",
    status_label: "Delivered",
    shipped_at: "2026-08-24T10:00:00Z",
    estimated_delivery: "2026-08-26",
    delivered_at: "2026-08-26T14:30:00Z",
    weight: 2.1,
    cost: 3500,
    label_url: null,
    created_at: "2026-08-24T08:00:00Z",
    updated_at: "2026-08-26T14:30:00Z",
    order: {
      id: "ord-2",
      order_number: "ORD-2026-0002",
      user_id: "user-2",
      status: "delivered",
      total_amount: 95000,
      currency_code: "NGN",
    },
  },
];

const mockShipmentDetail: ShipmentItem = {
  ...mockShipmentsList[0],
  tracking_events: [
    {
      id: "ev-1",
      shipment_id: "ship-1",
      status: "in_transit",
      location: "Ikeja Distribution Sorting Center",
      description: "Package arrived at regional distribution center",
      occurred_at: "2026-08-25T14:00:00Z",
    },
    {
      id: "ev-2",
      shipment_id: "ship-1",
      status: "picked_up",
      location: "Lagos Central Warehouse",
      description: "Courier picked up package from fulfillment warehouse",
      occurred_at: "2026-08-25T12:00:00Z",
    },
    {
      id: "ev-3",
      shipment_id: "ship-1",
      status: "label_created",
      location: "Lagos Central Warehouse",
      description: "Shipping label generated for carrier DHL",
      occurred_at: "2026-08-25T10:00:00Z",
    },
  ],
};

describe("Admin Shipping & Fulfillment Operations Suite (STEP 28.20)", () => {
  const mockUpdateStatusMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useWarehouses).mockReturnValue({
      data: mockWarehouses,
      isLoading: false,
      isError: false,
    } as any);

    vi.mocked(useShipments).mockReturnValue({
      data: {
        data: mockShipmentsList,
        meta: { current_page: 1, per_page: 15, total: 2, last_page: 1 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useShipment).mockReturnValue({
      data: mockShipmentDetail,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useUpdateShipmentStatus).mockReturnValue({
      mutateAsync: mockUpdateStatusMutateAsync,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and breadcrumb navigation", () => {
    render(<AdminShipmentsPage />);
    expect(screen.getByText("LOGISTICS & FULFILLMENT")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Shipment Directory" })).toBeInTheDocument();
  });

  it("2. Quick Metrics: renders total shipments, in transit, delivered, and label created counts", () => {
    render(<AdminShipmentsPage />);
    expect(screen.getByText("Total Shipments")).toBeInTheDocument();
    expect(screen.getAllByText("In Transit").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Delivered").length).toBeGreaterThan(0);
    expect(screen.getByText("Label Created / Pending")).toBeInTheDocument();
  });

  it("3. Shipments Table: renders tracking references, carrier badges, warehouses, and status pills", () => {
    render(<AdminShipmentsPage />);
    expect(screen.getByText("TRK-DHL-9812401")).toBeInTheDocument();
    expect(screen.getByText("TRK-FDX-7712390")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0002")).toBeInTheDocument();
    expect(screen.getByText("dhl")).toBeInTheDocument();
    expect(screen.getByText("fedex")).toBeInTheDocument();
    expect(screen.getAllByText("View").length).toBeGreaterThan(0);
  });

  it("4. Filters: updates search input, status selector, carrier selector, and warehouse selector", () => {
    render(<AdminShipmentsPage />);
    const searchInput = screen.getByPlaceholderText("Search by Tracking # or Order #...");
    fireEvent.change(searchInput, { target: { value: "TRK-DHL" } });
    expect(searchInput).toHaveProperty("value", "TRK-DHL");

    expect(screen.getByText("All Statuses")).toBeInTheDocument();
    expect(screen.getByText("All Carriers")).toBeInTheDocument();
    expect(screen.getByText("All Warehouses")).toBeInTheDocument();
  });

  it("5. Shipment Detail View: renders logistics summary, carrier details, parcel info, and linked order", async () => {
    await act(async () => {
      render(<ShipmentDetailPage params={Promise.resolve({ id: "ship-1" })} />);
    });
    expect(screen.getByText("SHIPMENT RECORD")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "TRK-DHL-9812401" })).toBeInTheDocument();
    expect(screen.getByText("Logistics Summary")).toBeInTheDocument();
    expect(screen.getByText("Linked Commercial Order")).toBeInTheDocument();
    expect(screen.getByText("ORD-2026-0001")).toBeInTheDocument();
    expect(screen.getByText("Elena Rostova")).toBeInTheDocument();
    expect(screen.getByText("742 Evergreen Terrace")).toBeInTheDocument();
    expect(screen.getByText("Ikeja, Lagos 100001")).toBeInTheDocument();
  });

  it("6. Tracking Timeline: renders live tracking scan events with timestamps and locations", async () => {
    await act(async () => {
      render(<ShipmentDetailPage params={Promise.resolve({ id: "ship-1" })} />);
    });
    expect(screen.getByText("Tracking Event Timeline")).toBeInTheDocument();
    expect(screen.getByText("Ikeja Distribution Sorting Center")).toBeInTheDocument();
    expect(screen.getByText("Package arrived at regional distribution center")).toBeInTheDocument();
    expect(screen.getByText("Courier picked up package from fulfillment warehouse")).toBeInTheDocument();
  });

  it("7. Update Status Modal: opens status dialog and triggers status mutation", async () => {
    await act(async () => {
      render(<ShipmentDetailPage params={Promise.resolve({ id: "ship-1" })} />);
    });
    const updateBtn = screen.getByRole("button", { name: /Update Status/i });
    fireEvent.click(updateBtn);

    expect(screen.getByText("Update Shipment Status")).toBeInTheDocument();

    const statusSelect = screen.getByLabelText(/Target Status/i);
    fireEvent.change(statusSelect, { target: { value: "out_for_delivery" } });

    const submitBtn = screen.getByRole("button", { name: "Submit Transition" });
    fireEvent.click(submitBtn);

    expect(mockUpdateStatusMutateAsync).toHaveBeenCalledWith({
      id: "ship-1",
      payload: {
        status: "out_for_delivery",
      },
    });
  });
});
