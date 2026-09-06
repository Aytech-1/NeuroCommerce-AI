import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { formatCurrency, getCurrencySymbol } from "@/lib/utils";
import { ProductCard } from "@/components/store/product-card";
import { CatalogFilters } from "@/components/store/catalog-filters";
import { ProductVariantManager } from "@/components/admin/product-variant-manager";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock router and hooks
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => "/admin/products",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/use-storefront", () => ({
  useAddToCart: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/hooks/use-catalog", () => ({
  useCreateVariant: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useUpdateVariant: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeleteVariant: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe("Product Pricing Currency Display Suite (FIX 2)", () => {
  describe("1. Currency Symbol Resolver (getCurrencySymbol)", () => {
    it("resolves NGN to ₦ symbol", () => {
      expect(getCurrencySymbol("NGN")).toBe("₦");
      expect(getCurrencySymbol()).toBe("₦");
    });

    it("resolves USD to $ symbol", () => {
      expect(getCurrencySymbol("USD")).toBe("$");
    });

    it("resolves EUR to € symbol", () => {
      expect(getCurrencySymbol("EUR")).toBe("€");
    });

    it("resolves GBP to £ symbol", () => {
      expect(getCurrencySymbol("GBP")).toBe("£");
    });
  });

  describe("2. Product Pricing Formatting & Duplicate Prevention", () => {
    it("formats NGN prices strictly with single ₦ symbol without duplication", () => {
      const formatted = formatCurrency(240000, "NGN");
      expect(formatted).toBe("₦240,000.00");
      expect(formatted).not.toContain("₦$");
      expect(formatted).not.toContain("$₦");
      expect(formatted).not.toContain("₦₦");
    });

    it("preserves multi-currency support when USD is specified", () => {
      const formatted = formatCurrency(240, "USD");
      expect(formatted).toBe("$240.00");
    });
  });

  describe("3. Storefront Product Card Component", () => {
    it("renders product card price using NGN currency formatting", () => {
      const mockProduct = {
        id: "prod-1",
        name: "Neural Interface Pro",
        slug: "neural-interface-pro",
        sku: "NC-NIP-001",
        currency_code: "NGN",
        base_price: 240000,
        sale_price: null,
        status: "active" as const,
        is_active: true,
        is_featured: true,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      renderWithQuery(<ProductCard product={mockProduct} />);

      const priceElement = screen.getByText("₦240,000.00");
      expect(priceElement).toBeInTheDocument();
      expect(priceElement.textContent).not.toContain("₦$");
      expect(priceElement.textContent).not.toContain("$₦");
    });
  });

  describe("4. Catalog Price Filters Component", () => {
    it("renders dynamic currency symbol instead of hardcoded $", () => {
      render(
        <CatalogFilters
          search=""
          onSearchChange={vi.fn()}
          category=""
          onCategoryChange={vi.fn()}
          brand=""
          onBrandChange={vi.fn()}
          minPrice={undefined}
          onMinPriceChange={vi.fn()}
          maxPrice={undefined}
          onMaxPriceChange={vi.fn()}
          inStock={false}
          onInStockChange={vi.fn()}
          hasActiveFilters={false}
          onClearFilters={vi.fn()}
        />
      );

      // Label should show Price Range (₦)
      expect(screen.getByText(/Price Range \(₦\)/i)).toBeInTheDocument();
      // Should not contain Price Range ($)
      expect(screen.queryByText(/Price Range \(\$\)/i)).not.toBeInTheDocument();
    });
  });

  describe("5. Product Variant Manager Pricing", () => {
    it("renders variant table prices with NGN currency formatting", () => {
      const mockVariants = [
        {
          id: "var-1",
          sku: "NC-NIP-001-BLK",
          name: "Midnight Black",
          price: 260000,
          compare_at_price: 280000,
          cost_price: 150000,
          is_active: true,
          sort_order: 0,
        },
      ];

      renderWithQuery(
        <ProductVariantManager
          productId="prod-1"
          basePrice={240000}
          currencyCode="NGN"
          existingVariants={mockVariants}
        />
      );

      expect(screen.getByText("₦260,000.00")).toBeInTheDocument();
    });
  });
});
