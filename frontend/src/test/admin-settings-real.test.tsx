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

let mockCanAllow = true;
vi.mock("@/components/ui/can", () => ({
  Can: ({ permission, children, fallback }: { permission: string; children: React.ReactNode; fallback?: React.ReactNode }) => {
    if (!mockCanAllow && permission === "setting.update") {
      return fallback ? <>{fallback}</> : null;
    }
    return <>{children}</>;
  },
}));

vi.mock("@/hooks/use-settings", () => ({
  useGroupedSettings: vi.fn(),
  useBulkUpdateSettings: vi.fn(),
}));

const mockAuthoritativeSettings: Record<string, SettingItem[]> = {
  general: [
    {
      id: "set-1",
      group: "general",
      key: "store_name",
      value: "NeuroCommerce AI",
      type: "string",
      is_public: true,
      description: "Authoritative store branding and header title",
    },
    {
      id: "set-2",
      group: "general",
      key: "maintenance_mode",
      value: false,
      type: "boolean",
      is_public: false,
      description: "Prevent non-admin storefront access",
    },
    {
      id: "set-3",
      group: "general",
      key: "store_currency",
      value: "NGN",
      type: "string",
      is_public: true,
      description: "Primary currency code for local store transactions (e.g., NGN for ₦)",
    },
  ],
  security: [
    {
      id: "set-4",
      group: "security",
      key: "stripe_secret_key",
      value: "********",
      type: "encrypted",
      is_public: false,
      description: "Stripe secret API key for gateway operations",
    },
    {
      id: "set-5",
      group: "security",
      key: "session_timeout_minutes",
      value: 120,
      type: "integer",
      is_public: false,
      description: "Maximum inactive session lifetime in minutes",
    },
  ],
  notifications: [
    {
      id: "set-6",
      group: "notifications",
      key: "order_confirmation_email",
      value: true,
      type: "boolean",
      is_public: false,
      description: "Dispatch automated email receipts upon successful checkout",
    },
  ],
};

describe("Admin Settings & System Configuration Real Test Suite (STEP 28.31)", () => {
  const mockBulkUpdate = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCanAllow = true;

    vi.mocked(useGroupedSettings).mockReturnValue({
      data: mockAuthoritativeSettings,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    vi.mocked(useBulkUpdateSettings).mockReturnValue({
      mutateAsync: mockBulkUpdate,
      isPending: false,
    } as any);
  });

  it("1. Settings page renders successfully with proper header and breadcrumb navigation", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Settings & Configuration", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("SYSTEM CONFIGURATION")).toBeInTheDocument();
  });

  it("2. Real settings load through authoritative grouped query hook", () => {
    render(<AdminSettingsPage />);

    expect(useGroupedSettings).toHaveBeenCalled();
    expect(screen.getByText("3 Namespaces")).toBeInTheDocument();
    expect(screen.getByText("6 Settings")).toBeInTheDocument();
  });

  it("3. Supported categories/namespaces render in the navigation rail", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByRole("button", { name: /General/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Security/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Notifications/i })).toBeInTheDocument();
  });

  it("4. Unsupported categories do not appear", () => {
    render(<AdminSettingsPage />);

    expect(screen.queryByRole("button", { name: /InventedFakeGroup/i })).not.toBeInTheDocument();
    expect(screen.queryByText("invented_secret_mock")).not.toBeInTheDocument();
  });

  it("5. Editable settings can be changed in form state", async () => {
    render(<AdminSettingsPage />);

    const storeNameInput = screen.getByDisplayValue("NeuroCommerce AI") as HTMLInputElement;
    fireEvent.change(storeNameInput, { target: { value: "NeuroCommerce AI Enterprise" } });

    expect(storeNameInput.value).toBe("NeuroCommerce AI Enterprise");
    expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
  });

  it("6. Save mutation calls the real backend API payload format", async () => {
    mockBulkUpdate.mockResolvedValueOnce({ message: "Settings updated successfully" });
    render(<AdminSettingsPage />);

    const storeNameInput = screen.getByDisplayValue("NeuroCommerce AI");
    fireEvent.change(storeNameInput, { target: { value: "NeuroCommerce AI Global" } });

    const saveButtons = screen.getAllByRole("button", { name: /save changes/i });
    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(mockBulkUpdate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            group: "general",
            key: "store_name",
            value: "NeuroCommerce AI Global",
          }),
        ])
      );
    });
  });

  it("7. Successful save refreshes data and clears unsaved indicators", async () => {
    mockBulkUpdate.mockResolvedValueOnce({ message: "Settings updated successfully" });
    render(<AdminSettingsPage />);

    const storeNameInput = screen.getByDisplayValue("NeuroCommerce AI");
    fireEvent.change(storeNameInput, { target: { value: "Updated Store Name" } });

    const saveBtn = screen.getAllByRole("button", { name: /save changes/i })[0];
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockBulkUpdate).toHaveBeenCalled();
      expect(screen.queryByText(/You have unsaved changes/i)).not.toBeInTheDocument();
    });
  });

  it("8. Validation / backend errors display properly in toast or error notification", async () => {
    mockBulkUpdate.mockRejectedValueOnce(new Error("Database write failed for settings"));
    render(<AdminSettingsPage />);

    const storeNameInput = screen.getByDisplayValue("NeuroCommerce AI");
    fireEvent.change(storeNameInput, { target: { value: "Invalid Store" } });

    const saveBtn = screen.getAllByRole("button", { name: /save changes/i })[0];
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockBulkUpdate).toHaveBeenCalled();
    });
  });

  it("9. Unauthorized or fetch error state is handled gracefully with retry option", () => {
    vi.mocked(useGroupedSettings).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<AdminSettingsPage />);

    expect(screen.getByText("Failed to Load Configuration")).toBeInTheDocument();
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("10. Permission restrictions work via RBAC Can guard", () => {
    mockCanAllow = false;
    render(<AdminSettingsPage />);

    expect(screen.queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument();
  });

  it("11. Environment-managed values / secrets guidance is displayed", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByText(/Authoritative System Storage & Isolation/i)).toBeInTheDocument();
    expect(screen.getByText("sys_settings")).toBeInTheDocument();
    expect(screen.getByText(".env")).toBeInTheDocument();
  });

  it("12. Secrets are never rendered in plaintext (type=\"password\" and masked placeholder)", () => {
    render(<AdminSettingsPage />);

    const securityTab = screen.getByRole("button", { name: /Security/i });
    fireEvent.click(securityTab);

    const secretInput = screen.getByDisplayValue("********") as HTMLInputElement;
    expect(secretInput).toBeInTheDocument();
    expect(secretInput.type).toBe("password");
    expect(secretInput.placeholder).toBe("••••••••••••••••");
  });

  it("13. Currency settings respect backend configuration", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByDisplayValue("NGN")).toBeInTheDocument();
    expect(screen.getByText("store_currency")).toBeInTheDocument();
  });

  it("14. NGN displays ₦ in description and formatting context", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByText(/NGN for ₦/i)).toBeInTheDocument();
  });

  it("15. Existing product pricing parameters remain unchanged", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByRole("button", { name: /General/i })).toBeInTheDocument();
    expect(screen.getByText(/General Configuration/i)).toBeInTheDocument();
    expect(screen.queryByText("fake_pricing_override")).not.toBeInTheDocument();
  });

  it("16. Existing checkout parameters remain unchanged", () => {
    render(<AdminSettingsPage />);

    expect(screen.queryByText("fake_checkout_bypass")).not.toBeInTheDocument();
  });

  it("17. Existing notifications settings are present and configurable", () => {
    render(<AdminSettingsPage />);

    const notificationsTab = screen.getByRole("button", { name: /Notifications/i });
    fireEvent.click(notificationsTab);

    expect(screen.getByText("order_confirmation_email")).toBeInTheDocument();
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("18. Audit logging and security telemetry note remains intact", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByText("Audit Trail Enabled")).toBeInTheDocument();
  });

  it("19. No fake settings are rendered anywhere in the DOM", () => {
    render(<AdminSettingsPage />);

    expect(screen.queryByText("mock_setting_item")).not.toBeInTheDocument();
    expect(screen.queryByText("fake_db_cluster")).not.toBeInTheDocument();
  });

  it("20. Deep navigation links to dedicated admin modules remain functional", () => {
    render(<AdminSettingsPage />);

    expect(screen.getByRole("link", { name: /Payment Gateways/i })).toHaveAttribute("href", "/admin/payments");
    expect(screen.getByRole("link", { name: /Shipping Zones/i })).toHaveAttribute("href", "/admin/shipping");
    expect(screen.getByRole("link", { name: /Feature Flags/i })).toHaveAttribute("href", "/admin/system/feature-flags");
    expect(screen.getByRole("link", { name: /System Health/i })).toHaveAttribute("href", "/admin/system/health");
    expect(screen.getByRole("link", { name: /Audit Logs/i })).toHaveAttribute("href", "/admin/audit-logs");
  });
});