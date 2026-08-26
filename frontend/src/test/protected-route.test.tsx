import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuthStore } from "@/stores/auth-store";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/admin/dashboard",
}));

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state while auth state is hydrating", () => {
    useAuthStore.setState({
      isLoading: true,
      isAuthenticated: false,
      user: null,
    });

    render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/verifying authentication session/i)).toBeInTheDocument();
    expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated user to /login", () => {
    useAuthStore.setState({
      isLoading: false,
      isAuthenticated: false,
      user: null,
    });

    render(
      <ProtectedRoute>
        <div>Secret Content</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalledWith("/login?redirect=%2Fadmin%2Fdashboard");
    expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
  });

  it("renders protected children when authenticated", () => {
    useAuthStore.setState({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: "1",
        first_name: "Customer",
        last_name: "User",
        email: "customer@example.com",
        role: "customer",
        is_active: true,
        created_at: "2026-08-21T00:00:00Z",
      },
    });

    render(
      <ProtectedRoute>
        <div>Secret Customer Dashboard</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Secret Customer Dashboard")).toBeInTheDocument();
  });

  it("blocks user with missing required role", () => {
    useAuthStore.setState({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: "1",
        first_name: "Customer",
        last_name: "User",
        email: "customer@example.com",
        role: "customer",
        is_active: true,
        created_at: "2026-08-21T00:00:00Z",
      },
    });

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Super Secret Admin Area</div>
      </ProtectedRoute>
    );

    expect(screen.getByText(/access restricted/i)).toBeInTheDocument();
    expect(screen.queryByText("Super Secret Admin Area")).not.toBeInTheDocument();
  });
});
