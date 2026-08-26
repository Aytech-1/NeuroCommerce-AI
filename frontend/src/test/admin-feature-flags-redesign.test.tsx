import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminFeatureFlagsPage from "@/app/(admin)/admin/feature-flags/page";
import { useFeatureFlags, useToggleFeatureFlag } from "@/hooks/use-feature-flags";
import { FeatureFlagItem } from "@/services/feature-flag-service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/feature-flags",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-feature-flags", () => ({
  useFeatureFlags: vi.fn(),
  useToggleFeatureFlag: vi.fn(),
}));

const mockFlags: FeatureFlagItem[] = [
  {
    name: "ai_neural_recommendations",
    description: "Real-time AI product recommendations based on neural activity",
    is_enabled: true,
    rollout_percentage: 50,
  },
  {
    name: "bci_express_checkout",
    description: "One-click biometric authorization checkout pipeline",
    is_enabled: false,
    rollout_percentage: 0,
  },
];

describe("Admin Feature Flags & Controlled Rollout Operations Suite (STEP 27.14)", () => {
  const mockToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    vi.mocked(useFeatureFlags).mockReturnValue({
      data: mockFlags,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useToggleFeatureFlag).mockReturnValue({
      mutateAsync: mockToggle,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and Refresh Flags CTA", () => {
    render(<AdminFeatureFlagsPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("FEATURE GOVERNANCE")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Feature Flags & Canary Rollout", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /refresh flags/i })).toBeInTheDocument();
  });

  it("2. Summary Metrics: renders authoritative feature flag telemetry", () => {
    render(<AdminFeatureFlagsPage />);

    expect(screen.getByText("Total Flags")).toBeInTheDocument();
    expect(screen.getByText("2 Toggles")).toBeInTheDocument();
    expect(screen.getAllByText("Active Flags").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("1 Active")).toBeInTheDocument();
    expect(screen.getAllByText("Disabled Flags").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("1 Disabled")).toBeInTheDocument();
  });

  it("3. Filter Toolbar & Search: updates search input and renders status options", () => {
    render(<AdminFeatureFlagsPage />);

    const searchInput = screen.getByPlaceholderText(/search feature flags by name or key/i);
    fireEvent.change(searchInput, { target: { value: "recommendations" } });
    expect(searchInput).toHaveValue("recommendations");

    expect(screen.getByText("All Flags")).toBeInTheDocument();
  });

  it("4. Feature Flag Cards: renders flag keys, badges, and canary percentages", () => {
    render(<AdminFeatureFlagsPage />);

    expect(screen.getByText("ai_neural_recommendations")).toBeInTheDocument();
    expect(screen.getByText("bci_express_checkout")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("5. Toggle Mutation: triggers toggle on switch change", () => {
    render(<AdminFeatureFlagsPage />);

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    expect(mockToggle).toHaveBeenCalledWith({
      name: "ai_neural_recommendations",
      isEnabled: false,
    });
  });

  it("6. Rollout Slider: triggers percentage update on slider change", () => {
    render(<AdminFeatureFlagsPage />);

    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0], { target: { value: "75" } });

    expect(mockToggle).toHaveBeenCalledWith({
      name: "ai_neural_recommendations",
      rollout: 75,
    });
  });

  it("7. Empty State: renders empty notice when 0 flags exist", () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminFeatureFlagsPage />);

    expect(screen.getByText("No Feature Flags Defined")).toBeInTheDocument();
  });
});
