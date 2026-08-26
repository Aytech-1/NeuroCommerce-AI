import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomerProfilePage from "@/app/(portal)/account/profile/page";
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
  useChangePassword,
} from "@/hooks/use-customer";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth-service";

vi.mock("@/hooks/use-customer", () => ({
  useCustomerProfile: vi.fn(),
  useUpdateCustomerProfile: vi.fn(),
  useChangePassword: vi.fn(),
}));

vi.mock("@/services/auth-service", () => ({
  authService: {
    logout: vi.fn().mockResolvedValue({}),
  },
}));

const mockProfile = {
  id: "u-1",
  first_name: "Sarah",
  last_name: "Connor",
  email: "sarah@cyberdyne.lab",
  phone: "+1 (555) 019-2834",
};

describe("Customer Profile & Account Security Suite (STEP 26.7)", () => {
  const mockUpdateProfile = vi.fn();
  const mockChangePassword = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuthStore.setState({
      user: mockProfile as any,
      token: "valid-token",
      isAuthenticated: true,
    });

    vi.mocked(useCustomerProfile).mockReturnValue({
      data: mockProfile,
      isLoading: false,
    } as any);

    vi.mocked(useUpdateCustomerProfile).mockReturnValue({
      mutate: mockUpdateProfile,
      isPending: false,
    } as any);

    vi.mocked(useChangePassword).mockReturnValue({
      mutate: mockChangePassword,
      isPending: false,
    } as any);
  });

  it("1. Profile Page Header & Identity Card: renders customer name, verified badge, and initials", () => {
    render(<CustomerProfilePage />);

    expect(screen.getByText("ACCOUNT SETTINGS")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: /profile & security/i })).toBeInTheDocument();
    expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    expect(screen.getByText("SC")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toBeInTheDocument();
  });

  it("2. Personal Information: preloads values and submits updated payload", async () => {
    render(<CustomerProfilePage />);

    const firstNameInput = screen.getByDisplayValue("Sarah");
    const lastNameInput = screen.getByDisplayValue("Connor");
    const phoneInput = screen.getByDisplayValue("+1 (555) 019-2834");

    fireEvent.change(firstNameInput, { target: { value: "Sarah Jane" } });
    const saveBtn = screen.getByRole("button", { name: /save profile changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: "Sarah Jane",
          last_name: "Connor",
          email: "sarah@cyberdyne.lab",
          phone: "+1 (555) 019-2834",
        }),
        expect.anything()
      );
    });
  });

  it("3. Password Management: validates password confirmation and submits password change", async () => {
    render(<CustomerProfilePage />);

    const currentPasswordInput = screen.getByLabelText(/^current password \*/i);
    const newPasswordInput = screen.getByLabelText(/^new password \*/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm new password \*/i);

    fireEvent.change(currentPasswordInput, { target: { value: "OldPassword123!" } });
    fireEvent.change(newPasswordInput, { target: { value: "NewSecretPass456!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "NewSecretPass456!" } });

    const updatePasswordBtn = screen.getByRole("button", { name: /update account password/i });
    fireEvent.click(updatePasswordBtn);

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith(
        expect.objectContaining({
          current_password: "OldPassword123!",
          password: "NewSecretPass456!",
          password_confirmation: "NewSecretPass456!",
        }),
        expect.anything()
      );
    });
  });

  it("4. Password Visibility Toggles: toggles visibility controls between password and text", () => {
    render(<CustomerProfilePage />);

    const currentPasswordInput = screen.getByLabelText(/^current password \*/i);
    expect(currentPasswordInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /show current password/i });
    fireEvent.click(toggleBtn);

    expect(currentPasswordInput).toHaveAttribute("type", "text");
  });

  it("5. Danger Zone: renders sign out action button", () => {
    render(<CustomerProfilePage />);

    expect(screen.getByText("Danger Zone")).toBeInTheDocument();
    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    expect(signOutBtn).toBeInTheDocument();
  });
});
