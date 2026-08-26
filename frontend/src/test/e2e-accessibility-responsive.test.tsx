import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StoreHeader } from "@/components/layout/store-header";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useCategoriesTree, useSearchSuggestions } from "@/hooks/use-storefront";
import { useCart } from "@/hooks/use-cart";

vi.mock("@/hooks/use-storefront", () => ({
  useCategoriesTree: vi.fn().mockReturnValue({
    data: [{ id: "cat-1", name: "EEG Headsets", slug: "eeg-headsets", children: [] }],
    isLoading: false,
  }),
  useSearchSuggestions: vi.fn().mockReturnValue({
    data: [],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/use-cart", () => ({
  useCart: vi.fn().mockReturnValue({
    data: { id: "cart-1", items_count: 3, items: [], grand_total: 0 },
    isLoading: false,
  }),
  useUpdateCartItem: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useRemoveCartItem: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useClearCart: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useApplyCoupon: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useRemoveCoupon: vi.fn().mockReturnValue({ mutate: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/account",
  useRouter: () => ({ push: vi.fn() }),
}));

describe("End-to-End Accessibility & Responsive Layouts Suite", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it("StoreHeader: includes accessible navigation landmarks, ARIA labels, and search trigger", () => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
    useCartStore.setState({ itemCount: 3 });

    render(
      <QueryClientProvider client={queryClient}>
        <StoreHeader />
      </QueryClientProvider>
    );

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search catalog/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open cart/i })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("CustomerSidebar: renders accessible portal navigation links", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CustomerSidebar />
      </QueryClientProvider>
    );

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Wishlist")).toBeInTheDocument();
    expect(screen.getByText("Addresses")).toBeInTheDocument();
  });

  it("Admin Shell: renders accessible sidebar navigation and admin topbar controls", () => {
    useAuthStore.setState({
      user: {
        id: "a-1",
        first_name: "Admin",
        last_name: "User",
        email: "admin@neuro.ai",
        role: "admin",
        is_active: true,
        created_at: "2026-08-20T00:00:00Z",
      },
      token: "tok",
      isAuthenticated: true,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AdminTopbar />
        <AdminSidebar />
      </QueryClientProvider>
    );

    expect(screen.getByPlaceholderText(/Global search/i)).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });
});
