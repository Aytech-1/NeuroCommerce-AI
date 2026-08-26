import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminFeatureFlagsPage from "@/app/(admin)/admin/feature-flags/page";
import { useFeatureFlags, useToggleFeatureFlag } from "@/hooks/use-feature-flags";
import { FeatureFlagItem } from "@/services/feature-flag-service";

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
];

describe("Admin Feature Flags Suite", () => {
  const mockToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToggleFeatureFlag).mockReturnValue({
      mutateAsync: mockToggle,
      isPending: false,
    } as any);
  });

  it("renders feature flag name, status badge, and rollout percentage", () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      data: mockFlags,
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminFeatureFlagsPage />);

    expect(screen.getByText("ai_neural_recommendations")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("triggers flag toggle mutation on switch click", () => {
    vi.mocked(useFeatureFlags).mockReturnValue({
      data: mockFlags,
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminFeatureFlagsPage />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledWith({
      name: "ai_neural_recommendations",
      isEnabled: false,
    });
  });
});
