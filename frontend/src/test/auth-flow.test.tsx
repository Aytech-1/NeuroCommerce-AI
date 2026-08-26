import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/stores/auth-store";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: () => null,
  }),
}));

vi.mock("@/services/auth-service", () => ({
  authService: {
    login: vi.fn(),
  },
}));

describe("Authentication Flow — LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it("renders login form with email, password fields and sign in button", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("toggles password visibility when eye button is clicked", () => {
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText("••••••••");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button", { name: /show password/i });
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("validates empty email and displays validation message", async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address|email is required/i)).toBeInTheDocument();
    });
  });

  it("submits valid credentials and sets authentication state on success", async () => {
    const mockUser = {
      id: "usr-123",
      first_name: "Admin",
      last_name: "User",
      email: "admin@neurocommerce.ai",
      role: "admin",
      roles: ["admin"],
      permissions: ["*"],
      is_active: true,
      created_at: "2026-08-21T00:00:00Z",
    };

    vi.mocked(authService.login).mockResolvedValueOnce({
      user: mockUser,
      token: "mock-token-abc",
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
      target: { value: "admin@neurocommerce.ai" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: "admin@neurocommerce.ai",
        password: "password123",
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().token).toBe("mock-token-abc");
      expect(mockPush).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("handles authentication failure and displays backend error message", async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      status: 401,
      message: "Invalid login credentials.",
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("you@company.com"), {
      target: { value: "wrong@neurocommerce.ai" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid login credentials.");
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
