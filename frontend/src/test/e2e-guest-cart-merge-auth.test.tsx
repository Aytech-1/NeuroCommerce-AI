import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { authService } from "@/services/auth-service";

vi.mock("@/services/auth-service", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "redirect" ? "/checkout" : null),
  }),
}));

describe("End-to-End Authentication & Guest Cart Merge Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    useCartStore.setState({ itemCount: 2, sessionId: "guest-session-uuid" });
  });

  it("authenticates customer and persists token in auth store", async () => {
    vi.mocked(authService.login).mockResolvedValue({
      user: {
        id: "u-1",
        first_name: "Sarah",
        last_name: "Connor",
        email: "sarah@cyberdyne.lab",
        role: "customer",
        is_active: true,
        created_at: "2026-08-20T00:00:00Z",
      },
      token: "sanctum-token-xyz",
      permissions: ["view_catalog", "place_order"],
    });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("you@company.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitBtn = screen.getByRole("button", { name: "Sign In" });

    fireEvent.change(emailInput, { target: { value: "sarah@cyberdyne.lab" } });
    fireEvent.change(passwordInput, { target: { value: "Secret123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: "sarah@cyberdyne.lab",
        password: "Secret123!",
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.first_name).toBe("Sarah");
    });
  });

  it("registers new customer researcher and sets credentials", async () => {
    vi.mocked(authService.register).mockResolvedValue({
      user: {
        id: "u-2",
        first_name: "John",
        last_name: "Doe",
        email: "john@neuro.lab",
        role: "customer",
        is_active: true,
        created_at: "2026-08-20T00:00:00Z",
      },
      token: "sanctum-token-new",
      permissions: ["view_catalog", "place_order"],
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("John"), { target: { value: "John" } });
    fireEvent.change(screen.getByPlaceholderText("Doe"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByPlaceholderText("you@company.com"), { target: { value: "john@neuro.lab" } });

    const passwordInputs = screen.getAllByPlaceholderText("••••••••");
    fireEvent.change(passwordInputs[0], { target: { value: "SecurePass123!" } });
    fireEvent.change(passwordInputs[1], { target: { value: "SecurePass123!" } });

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        first_name: "John",
        last_name: "Doe",
        email: "john@neuro.lab",
        password: "SecurePass123!",
        password_confirmation: "SecurePass123!",
      });
    });
  });
});
