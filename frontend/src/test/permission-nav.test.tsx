import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Can } from "@/components/ui/can";
import { useAuthStore } from "@/stores/auth-store";

describe("Permission-aware UI (Can Component)", () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  });

  it("hides permission-gated content when user lacks permission", () => {
    useAuthStore.setState({
      user: {
        id: "1",
        first_name: "Staff",
        last_name: "User",
        email: "staff@example.com",
        role: "staff",
        permissions: ["order.view"],
        is_active: true,
        created_at: "2026-08-21T00:00:00Z",
      },
      isAuthenticated: true,
    });

    render(
      <Can permission="product.delete">
        <button>Delete Product</button>
      </Can>
    );

    expect(screen.queryByRole("button", { name: /delete product/i })).not.toBeInTheDocument();
  });

  it("shows permission-gated content when user has explicit permission", () => {
    useAuthStore.setState({
      user: {
        id: "1",
        first_name: "Staff",
        last_name: "User",
        email: "staff@example.com",
        role: "staff",
        permissions: ["product.create", "product.view"],
        is_active: true,
        created_at: "2026-08-21T00:00:00Z",
      },
      isAuthenticated: true,
    });

    render(
      <Can permission="product.create">
        <button>Create Product</button>
      </Can>
    );

    expect(screen.getByRole("button", { name: /create product/i })).toBeInTheDocument();
  });

  it("allows all permissions for admin role", () => {
    useAuthStore.setState({
      user: {
        id: "1",
        first_name: "Super",
        last_name: "Admin",
        email: "admin@example.com",
        role: "admin",
        permissions: [],
        is_active: true,
        created_at: "2026-08-21T00:00:00Z",
      },
      isAuthenticated: true,
    });

    render(
      <Can permission="sensitive.audit.delete">
        <button>Super Admin Action</button>
      </Can>
    );

    expect(screen.getByRole("button", { name: /super admin action/i })).toBeInTheDocument();
  });
});
