import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminSettingsPage from "@/app/(admin)/admin/settings/page";
import { useGroupedSettings, useBulkUpdateSettings } from "@/hooks/use-settings";
import { SettingItem } from "@/services/settings-service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/admin/settings",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/can", () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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

describe("Admin System Configuration Operations Suite (STEP 27.13)", () => {
  const mockBulkUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useGroupedSettings).mockReturnValue({
      data: mockSettings,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    vi.mocked(useBulkUpdateSettings).mockReturnValue({
      mutateAsync: mockBulkUpdate,
      isPending: false,
    } as any);
  });

  it("1. Header & Breadcrumbs: renders title, eyebrow, and Save Changes CTA", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByText("SYSTEM CONFIGURATION")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Settings & Configuration", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /save changes/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("2. Summary Metrics: renders authoritative configuration telemetry", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByText("Configuration Groups")).toBeInTheDocument();
    expect(screen.getByText("2 Namespaces")).toBeInTheDocument();
    expect(screen.getByText("Total Parameters")).toBeInTheDocument();
    expect(screen.getByText("3 Settings")).toBeInTheDocument();
    expect(screen.getByText("Public Endpoints")).toBeInTheDocument();
    expect(screen.getByText("1 Public")).toBeInTheDocument();
    expect(screen.getByText("Encrypted Secrets")).toBeInTheDocument();
    expect(screen.getByText("1 Encrypted")).toBeInTheDocument();
  });

  it("3. Navigation Rail & Setting Fields: switches groups and masks secrets", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByText("store_name")).toBeInTheDocument();
    expect(screen.getByText("maintenance_mode")).toBeInTheDocument();
    expect(screen.getByText("Public")).toBeInTheDocument();

    fireEvent.click(screen.getByText("security"));

    expect(screen.getByText("stripe_secret_key")).toBeInTheDocument();
    expect(screen.getByText("Secret")).toBeInTheDocument();
    const secretInput = screen.getByPlaceholderText("••••••••••••••••");
    expect(secretInput).toHaveAttribute("type", "password");
  });

  it("4. Form Changes & Save: triggers bulk update mutation on save", async () => {
    render(<AdminSettingsPage />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(screen.getByText("Unsaved Changes")).toBeInTheDocument();

    const saveButtons = screen.getAllByRole("button", { name: /save changes/i });
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(mockBulkUpdate).toHaveBeenCalled();
    });
  });

  it("5. Search in Namespace: filters settings by keyword", () => {
    render(<AdminSettingsPage />);

    const searchInput = screen.getByPlaceholderText("Search in namespace...");
    fireEvent.change(searchInput, { target: { value: "maintenance" } });

    expect(screen.getByText("maintenance_mode")).toBeInTheDocument();
    expect(screen.queryByText("store_name")).not.toBeInTheDocument();
  });

  it("6. Empty State: renders empty notice when 0 settings exist", () => {
    vi.mocked(useGroupedSettings).mockReturnValue({
      data: {},
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any);

    render(<AdminSettingsPage />);

    expect(screen.getByText("No Settings Found")).toBeInTheDocument();
  });
});
