import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminSettingsPage from "@/app/(admin)/admin/settings/page";
import { useGroupedSettings, useBulkUpdateSettings } from "@/hooks/use-settings";
import { SettingItem } from "@/services/settings-service";

vi.mock("@/hooks/use-settings", () => ({
  useGroupedSettings: vi.fn(),
  useBulkUpdateSettings: vi.fn(),
}));

const mockSettings: Record<string, SettingItem[]> = {
  general: [
    {
      group: "general",
      key: "store_name",
      value: "NeuroCommerce AI",
      type: "string",
      is_public: true,
      description: "Public store branding name",
    },
    {
      group: "general",
      key: "maintenance_mode",
      value: false,
      type: "boolean",
      is_public: false,
      description: "Prevent non-admin storefront access",
    },
  ],
  security: [
    {
      group: "security",
      key: "stripe_secret_key",
      value: "sk_test_12345",
      type: "encrypted",
      is_public: false,
      description: "Stripe secret payment key",
    },
  ],
};

describe("Admin Settings Management Suite", () => {
  const mockBulkUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBulkUpdateSettings).mockReturnValue({
      mutateAsync: mockBulkUpdate,
      isPending: false,
    } as any);
  });

  it("renders grouped settings tabs and setting fields", () => {
    vi.mocked(useGroupedSettings).mockReturnValue({
      data: mockSettings,
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminSettingsPage />);

    expect(screen.getByText("store_name")).toBeInTheDocument();
    expect(screen.getByText("maintenance_mode")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();
  });

  it("masks encrypted secret settings", () => {
    vi.mocked(useGroupedSettings).mockReturnValue({
      data: mockSettings,
      isLoading: false,
      isError: false,
    } as any);

    render(<AdminSettingsPage />);

    fireEvent.click(screen.getByText("security"));

    expect(screen.getByText("stripe_secret_key")).toBeInTheDocument();
    expect(screen.getByText("Secret")).toBeInTheDocument();
    const secretInput = screen.getByPlaceholderText("••••••••••••••••");
    expect(secretInput).toHaveAttribute("type", "password");
  });
});
