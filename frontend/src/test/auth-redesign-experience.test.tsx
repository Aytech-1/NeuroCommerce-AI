import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";
import ResetPasswordPage from "@/app/(auth)/reset-password/page";
import { authService } from "@/services/auth-service";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth-store";

const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/services/auth-service", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
  },
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe("Complete Authentication Experience UI Redesign (STEP 26.14)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("1. Login Screen: renders split layout, brand panel, SSL badge, and sign in form", () => {
    render(<LoginPage />);

    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
    expect(screen.getByText("Secure & Protected")).toBeInTheDocument();
    expect(screen.getByText("256-bit SSL Encryption")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
  });

  it("2. Register Screen: renders split layout, password strength meter, and terms validation", async () => {
    render(<RegisterPage />);

    expect(screen.getAllByText("Create Your Account").length).toBeGreaterThan(0);
    expect(screen.getByText("Secure & Private")).toBeInTheDocument();
    expect(screen.getByLabelText(/first name \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name \*/i)).toBeInTheDocument();

    const passwordInput = screen.getByLabelText(/^password \*/i);
    fireEvent.change(passwordInput, { target: { value: "ComplexPass123!" } });

    await waitFor(() => {
      expect(screen.getByText(/password strength:/i)).toBeInTheDocument();
    });
  });

  it("3. Forgot Password Screen: renders reset form with what happens next guidance", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
    expect(screen.getByText("Reset Your Password")).toBeInTheDocument();
    expect(screen.getByText("What happens next?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });

  it("4. Reset Link Sent State: transitions to email sent confirmation view", async () => {
    vi.mocked(authService.forgotPassword).mockResolvedValueOnce("Reset link dispatched");

    render(<ForgotPasswordPage />);

    const emailInput = screen.getByLabelText(/email address \*/i);
    fireEvent.change(emailInput, { target: { value: "researcher@mit.edu" } });

    const formElement = screen.getByRole("button", { name: /send reset link/i }).closest("form");
    fireEvent.submit(formElement!);

    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith("researcher@mit.edu");
    });

    await waitFor(() => {
      expect(screen.getAllByText(/Reset Link Sent Successfully!/i).length).toBeGreaterThan(0);
      expect(screen.getAllByRole("link", { name: /back to login/i }).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("5. Reset Link Expired State: renders expired advisory when token is missing", () => {
    render(<ResetPasswordPage />);

    expect(screen.getByText("Reset Link Expired")).toBeInTheDocument();
    expect(screen.getByText("This Link Has Expired")).toBeInTheDocument();
    expect(screen.getByText("What you can do")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /send new reset link/i })).toHaveAttribute("href", "/forgot-password");
  });

  it("6. Reset Password Form: renders create new password when token is present", async () => {
    mockSearchParams = new URLSearchParams({ token: "valid-token-123", email: "test@neuro.lab" });
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { data: null, message: "Success" } });

    render(<ResetPasswordPage />);

    expect(screen.getByText("Create New Password")).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password \*/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/^new password \*/i), { target: { value: "NewPass123!" } });
    fireEvent.change(screen.getByLabelText(/confirm new password \*/i), { target: { value: "NewPass123!" } });

    const resetBtn = screen.getByRole("button", { name: /reset password/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith("/auth/reset-password", {
        token: "valid-token-123",
        email: "test@neuro.lab",
        password: "NewPass123!",
        password_confirmation: "NewPass123!",
      });
    });
  });
});
