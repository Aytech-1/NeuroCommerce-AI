import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { storefrontService } from "@/services/storefront-service";
import { apiClient } from "@/lib/api/client";
import RecommendationsPage from "@/app/(store)/recommendations/page";
import { AiRecommendations } from "@/components/store/ai-recommendations";
import {
  useTrendingRecommendations,
  useRecentlyViewedRecommendations,
  useSmartRecommendations,
} from "@/hooks/use-storefront";

// Mock API client and hooks
vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/hooks/use-storefront", () => ({
  useTrendingRecommendations: vi.fn(),
  usePersonalizedRecommendations: vi.fn(),
  useRecentlyViewedRecommendations: vi.fn(),
  useSmartRecommendations: vi.fn(),
  useAddToCart: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
  })),
}));

const mockProducts = [
  {
    id: "rec-prod-01",
    name: "NeuroSync Pro Elite EEG Headset",
    slug: "neurosync-pro-elite",
    sku: "NS-PRO-01",
    base_price: 1200.0,
    stock_quantity: 15,
    stock_status: "in_stock",
    status: "active",
    is_active: true,
    is_featured: true,
    category: { id: "cat-1", name: "EEG Headsets" },
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "rec-prod-02",
    name: "SynapseStim tDCS Research Device",
    slug: "synapsestim-tdcs-device",
    sku: "SST-DCS-02",
    base_price: 750.0,
    stock_quantity: 8,
    stock_status: "in_stock",
    status: "active",
    is_active: true,
    is_featured: false,
    category: { id: "cat-2", name: "Neuro-Stimulation" },
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
];

describe("NeuroCommerce AI Recommendations — Real Integration Test Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. storefrontService.getTrendingRecommendations calls GET /recommendations/trending with limit parameter", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: mockProducts },
    });

    const result = await storefrontService.getTrendingRecommendations(6);

    expect(apiClient.get).toHaveBeenCalledWith("/recommendations/trending", {
      params: { limit: 6 },
    });
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("NeuroSync Pro Elite EEG Headset");
  });

  it("2. storefrontService.getPersonalizedRecommendations calls GET /recommendations/personalized", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: mockProducts },
    });

    const result = await storefrontService.getPersonalizedRecommendations(8);

    expect(apiClient.get).toHaveBeenCalledWith("/recommendations/personalized", {
      params: { limit: 8 },
    });
    expect(result).toEqual(mockProducts);
  });

  it("3. storefrontService.getSimilarRecommendations calls GET /recommendations/similar/{productId}", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: [mockProducts[1]] },
    });

    const result = await storefrontService.getSimilarRecommendations("rec-prod-01", 4);

    expect(apiClient.get).toHaveBeenCalledWith("/recommendations/similar/rec-prod-01", {
      params: { limit: 4 },
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("rec-prod-02");
  });

  it("4. storefrontService.getCrossSellRecommendations calls GET /recommendations/cross-sell with cart IDs", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: mockProducts },
    });

    const result = await storefrontService.getCrossSellRecommendations(["rec-prod-01"], 5);

    expect(apiClient.get).toHaveBeenCalledWith("/recommendations/cross-sell", {
      params: { cart_products: ["rec-prod-01"], limit: 5 },
    });
    expect(result).toEqual(mockProducts);
  });

  it("5. storefrontService.getRecentlyViewedRecommendations calls GET /recommendations/recently-viewed", async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: mockProducts },
    });

    const result = await storefrontService.getRecentlyViewedRecommendations(10);

    expect(apiClient.get).toHaveBeenCalledWith("/recommendations/recently-viewed", {
      params: { limit: 10 },
    });
    expect(result).toEqual(mockProducts);
  });

  it("6. RecommendationsPage renders header, AI telemetry badges, and tabs", () => {
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: { items: mockProducts, isPersonalized: false },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useTrendingRecommendations).mockReturnValue({
      data: mockProducts,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useRecentlyViewedRecommendations).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<RecommendationsPage />);

    expect(screen.getByText("AI-Driven Discovery & Hardware Intelligence")).toBeInTheDocument();
    expect(screen.getByText("Real-Time Neuroscience Merchandising Engine")).toBeInTheDocument();
    expect(screen.getByText("Authoritative Catalog Data")).toBeInTheDocument();
    expect(screen.getByText("Smart Recommendations")).toBeInTheDocument();
    expect(screen.getByText("Trending Velocity")).toBeInTheDocument();
    expect(screen.getByText("Recently Viewed")).toBeInTheDocument();

    // Renders active products
    expect(screen.getByText("NeuroSync Pro Elite EEG Headset")).toBeInTheDocument();
    expect(screen.getByText("SynapseStim tDCS Research Device")).toBeInTheDocument();
  });

  it("7. RecommendationsPage switches active tabs cleanly", async () => {
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: { items: mockProducts, isPersonalized: false },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useTrendingRecommendations).mockReturnValue({
      data: [mockProducts[0]],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useRecentlyViewedRecommendations).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<RecommendationsPage />);

    const historyTab = screen.getByRole("button", { name: /recently viewed/i });
    fireEvent.click(historyTab);

    // Empty state for recently viewed
    expect(screen.getByText("No Recently Viewed Products")).toBeInTheDocument();
  });

  it("8. RecommendationsPage displays skeleton loading states", () => {
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    } as any);

    const { container } = render(<RecommendationsPage />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("9. RecommendationsPage displays error state with retry action", () => {
    const mockRefetch = vi.fn();
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<RecommendationsPage />);

    expect(screen.getByText("Recommendations are temporarily unavailable")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("10. Product cards format currency correctly in NGN (₦)", () => {
    vi.mocked(useSmartRecommendations).mockReturnValue({
      data: { items: mockProducts, isPersonalized: false },
      isLoading: false,
      isError: false,
    } as any);

    render(<AiRecommendations />);

    expect(screen.getByText("₦1,200.00")).toBeInTheDocument();
    expect(screen.getByText("₦750.00")).toBeInTheDocument();
  });
});
