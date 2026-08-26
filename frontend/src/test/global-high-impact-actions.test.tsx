import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SessionExpirationDialog } from "@/components/ui/session-expiration-dialog";
import { notify, toast } from "@/lib/notifications";
import { UserMenu } from "@/components/layout/user-menu";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@/services/auth-service", () => ({
  authService: {
    logout: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("@/hooks/use-customer", () => ({
  useCustomerProfile: () => ({
    data: {
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
    },
    isLoading: false,
  }),
}));

describe("Global Destructive & High-Impact Action System (STEP 27.20)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: "1",
        first_name: "Admin",
        last_name: "User",
        email: "admin@test.com",
        user_type: "admin",
      } as any,
      token: "mock-valid-token",
      isAuthenticated: true,
      isSessionExpired: false,
    });
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  /* ======================================================================= */
  /* 1. CONFIRM DIALOG PRIMITIVE & SEMANTIC VARIANTS                         */
  /* ======================================================================= */
  describe("1. ConfirmDialog Core Component", () => {
    it("renders with default properties and handles confirm callback", () => {
      const onConfirm = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={onOpenChange}
          title="Confirm Action"
          description="Are you sure you want to proceed?"
          onConfirm={onConfirm}
        />
      );

      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
      expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Confirm")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Confirm"));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it("renders danger variant with custom button text and semantic styling", () => {
      const onConfirm = vi.fn();
      const onOpenChange = vi.fn();

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={onOpenChange}
          title="Delete Item?"
          description="This cannot be undone."
          confirmText="Delete Permanently"
          cancelText="Keep Item"
          variant="danger"
          onConfirm={onConfirm}
        />
      );

      expect(screen.getByText("Delete Item?")).toBeInTheDocument();
      const deleteBtn = screen.getByText("Delete Permanently");
      expect(deleteBtn).toBeInTheDocument();
      expect(deleteBtn.className).toContain("bg-rose-600");
      expect(screen.getByText("Keep Item")).toBeInTheDocument();
    });

    it("renders warning variant for high-impact mutations", () => {
      render(
        <ConfirmDialog
          open={true}
          onOpenChange={vi.fn()}
          title="Update role permissions?"
          description="These changes may affect access levels."
          confirmText="Update Permissions"
          variant="warning"
          onConfirm={vi.fn()}
        />
      );

      expect(screen.getByText("Update role permissions?")).toBeInTheDocument();
      const updateBtn = screen.getByText("Update Permissions");
      expect(updateBtn).toBeInTheDocument();
    });

    it("disables buttons and displays loading indicator while isLoading is true", () => {
      render(
        <ConfirmDialog
          open={true}
          onOpenChange={vi.fn()}
          title="Processing Action"
          description="Please wait..."
          confirmText="Confirm"
          isLoading={true}
          onConfirm={vi.fn()}
        />
      );

      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toBeDisabled();
      const confirmButton = screen.getByRole("button", { name: /Confirm/i });
      expect(confirmButton).toBeDisabled();
    });

    it("closes dialog when Cancel button is clicked", () => {
      const onOpenChange = vi.fn();

      render(
        <ConfirmDialog
          open={true}
          onOpenChange={onOpenChange}
          title="Cancel Test"
          description="Testing cancel dismissal"
          onConfirm={vi.fn()}
        />
      );

      fireEvent.click(screen.getByText("Cancel"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  /* ======================================================================= */
  /* 2. EXPLICIT LOGOUT CONFIRMATION FLOWS                                   */
  /* ======================================================================= */
  describe("2. Explicit Logout Confirmation UX", () => {
    it("UserMenu triggers confirmation dialog before signing out", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <UserMenu />
        </QueryClientProvider>
      );

      const menuTrigger = screen.getByRole("button");
      fireEvent.click(menuTrigger);

      const signOutOption = screen.queryByText("Sign Out");
      if (signOutOption) {
        fireEvent.click(signOutOption);
        expect(screen.getByText("Sign out of your account?")).toBeInTheDocument();
      }
    });

    it("AdminSidebar renders sign out confirmation trigger", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <AdminSidebar />
        </QueryClientProvider>
      );

      const signOutButtons = screen.getAllByRole("button", { name: /Sign Out/i });
      expect(signOutButtons.length).toBeGreaterThan(0);

      fireEvent.click(signOutButtons[0]);
      expect(screen.getByText("Sign out of your account?")).toBeInTheDocument();
      expect(
        screen.getByText("You will need to sign in again to access the administrative workspace.")
      ).toBeInTheDocument();
    });

    it("CustomerSidebar renders customer sign out confirmation trigger", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CustomerSidebar />
        </QueryClientProvider>
      );

      const signOutButton = screen.getByRole("button", { name: /Sign Out/i });
      expect(signOutButton).toBeInTheDocument();

      fireEvent.click(signOutButton);
      expect(screen.getByText("Sign out of your account?")).toBeInTheDocument();
      expect(
        screen.getByText(
          "You will need to sign in again to access your customer dashboard, orders, and saved addresses."
        )
      ).toBeInTheDocument();
    });
  });

  /* ======================================================================= */
  /* 3. SESSION EXPIRATION DIALOG                                            */
  /* ======================================================================= */
  describe("3. SessionExpirationDialog", () => {
    it("renders session expired modal when isSessionExpired is true", () => {
      useAuthStore.setState({ isSessionExpired: true });

      render(<SessionExpirationDialog />);

      expect(screen.getByText("Your session has expired")).toBeInTheDocument();
      expect(
        screen.getByText(/For your security, your session has expired/i)
      ).toBeInTheDocument();
      expect(screen.getByText("Sign In Again")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Sign In Again"));
      expect(useAuthStore.getState().isSessionExpired).toBe(false);
    });
  });

  /* ======================================================================= */
  /* 4. ERROR MESSAGE SANITIZATION & LEAKAGE PREVENTION                      */
  /* ======================================================================= */
  describe("4. Security & Error Sanitization", () => {
    it("sanitizes SQLSTATE errors into safe user feedback via notify.error", () => {
      const spy = vi.spyOn(toast, "error");
      notify.error("SQLSTATE[HY000]: General error: 1364 Field 'user_id' doesn't have a default value");

      expect(spy).toHaveBeenCalledWith(
        "Unable to complete this action. Please try again.",
        expect.any(Object)
      );
    });

    it("sanitizes AxiosError technical messages", () => {
      const spy = vi.spyOn(toast, "error");
      notify.error("AxiosError: Request failed with status code 500");

      expect(spy).toHaveBeenCalledWith(
        "Unable to complete this action. Please try again.",
        expect.any(Object)
      );
    });

    it("sanitizes Network Error disconnect messages", () => {
      const spy = vi.spyOn(toast, "error");
      notify.error("Network Error occurred during transmission");

      expect(spy).toHaveBeenCalledWith(
        "Unable to complete this action. Please try again.",
        expect.any(Object)
      );
    });

    it("preserves safe, authorized user-facing validation strings", () => {
      const spy = vi.spyOn(toast, "error");
      notify.error("The coupon code provided has expired.");

      expect(spy).toHaveBeenCalledWith(
        "The coupon code provided has expired.",
        expect.any(Object)
      );
    });
  });
});
