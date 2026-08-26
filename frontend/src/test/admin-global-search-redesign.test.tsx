import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { AdminCommandPalette } from "@/components/admin/admin-command-palette";
import { useAuthStore } from "@/stores/auth-store";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/components/layout/user-menu", () => ({
  UserMenu: () => <div data-testid="user-menu" />,
}));

vi.mock("@/components/layout/notification-menu", () => ({
  NotificationMenu: () => <div data-testid="notification-menu" />,
}));

describe("Admin Global Search & Command Center Suite (STEP 27.16)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAuthStore).mockReturnValue({
      user: {
        id: "u-admin",
        name: "Admin User",
        email: "admin@neurocommerce.ai",
        role: "super_admin",
        permissions: ["*"],
      },
    } as any);
  });

  it("1. Topbar Trigger: renders search placeholder and ⌘K badge", () => {
    render(<AdminTopbar />);

    expect(screen.getByPlaceholderText(/global search/i)).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
  });

  it("2. Click Trigger: opens command palette on topbar search click", () => {
    render(<AdminTopbar />);

    const searchInput = screen.getByPlaceholderText(/global search/i);
    fireEvent.click(searchInput);

    expect(screen.getByPlaceholderText(/search commands, products, orders, customers/i)).toBeInTheDocument();
  });

  it("3. Keyboard Shortcut: opens command palette on Cmd+K / Ctrl+K", () => {
    render(<AdminTopbar />);

    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(screen.getByPlaceholderText(/search commands, products, orders, customers/i)).toBeInTheDocument();
  });

  it("4. Category Grouping: renders grouped navigation categories in initial state", () => {
    render(<AdminCommandPalette open={true} onOpenChange={vi.fn()} />);

    expect(screen.getAllByText("NAVIGATION").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("COMMERCE").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("MARKETING").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("GOVERNANCE").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("CONFIGURATION").length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("Dashboard & Executive Overview")).toBeInTheDocument();
    expect(screen.getByText("Products & Catalog")).toBeInTheDocument();
    expect(screen.getByText("Orders & Fulfillment")).toBeInTheDocument();
  });

  it("5. Live Search & Filtering: filters items matching search query", () => {
    render(<AdminCommandPalette open={true} onOpenChange={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search commands, products, orders, customers/i);
    fireEvent.change(searchInput, { target: { value: "coupon" } });

    expect(screen.getByText("Coupons & Promotions")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard & Executive Overview")).not.toBeInTheDocument();
  });

  it("6. Keyboard Arrow Navigation & Enter: navigates with arrow keys and triggers route push on Enter", () => {
    const handleOpenChange = vi.fn();
    render(<AdminCommandPalette open={true} onOpenChange={handleOpenChange} />);

    const searchInput = screen.getByPlaceholderText(/search commands, products, orders, customers/i);
    fireEvent.change(searchInput, { target: { value: "audit" } });

    fireEvent.keyDown(searchInput, { key: "ArrowDown" });
    fireEvent.keyDown(searchInput, { key: "Enter" });

    expect(mockPush).toHaveBeenCalledWith("/admin/audit-logs");
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("7. Clear Search: clears search input when clear button clicked", () => {
    render(<AdminCommandPalette open={true} onOpenChange={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search commands, products, orders, customers/i);
    fireEvent.change(searchInput, { target: { value: "staff" } });

    const clearButton = screen.getByRole("button", { name: /clear search/i });
    fireEvent.click(clearButton);

    expect(searchInput).toHaveValue("");
    expect(screen.getByText("Dashboard & Executive Overview")).toBeInTheDocument();
  });

  it("8. No Results State: shows helpful fallback when query matches nothing", () => {
    render(<AdminCommandPalette open={true} onOpenChange={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search commands, products, orders, customers/i);
    fireEvent.change(searchInput, { target: { value: "nonexistent-keyword-xyz" } });

    expect(screen.getByText("No Results Found")).toBeInTheDocument();
  });
});
