import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UserMenu } from "@/components/layout/user-menu";
import { useAuthStore } from "@/stores/auth-store";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/services/auth-service", () => ({
  authService: {
    logout: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("UserMenu Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows Sign In button when unauthenticated", () => {
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
    });

    render(<UserMenu />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows user initials and opens dropdown on click when authenticated", () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: {
        id: "1",
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@example.com",
        role: "customer",
        is_active: true,
        created_at: "2026-08-21T00:00:00Z",
      },
    });

    render(<UserMenu />);

    const menuButton = screen.getByRole("button", { name: /user account menu/i });
    expect(menuButton).toHaveTextContent("JD");

    fireEvent.click(menuButton);

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
  });
});
