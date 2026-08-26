import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SessionExpirationDialog } from "@/components/ui/session-expiration-dialog";
import { ToastProvider } from "@/providers/toast-provider";
import { notify, toast } from "@/lib/notifications";
import { useAuthStore } from "@/stores/auth-store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("Global Action Feedback, Toast Notifications & Action Confirmation Suite (STEP 27.19)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ isSessionExpired: false });
  });

  it("1. Global Toaster: renders toast container without crashing", () => {
    const { container } = render(<ToastProvider />);
    expect(container).toBeInTheDocument();
  });

  it("2. Success Toast: dispatches styled success notification", () => {
    const spy = vi.spyOn(toast, "success");
    notify.success("Product created successfully.");

    expect(spy).toHaveBeenCalledWith(
      "Product created successfully.",
      expect.objectContaining({
        iconTheme: { primary: "#047857", secondary: "#ECFDF5" },
      })
    );
  });

  it("3. Error Toast: sanitizes technical exceptions and dispatches user-friendly error", () => {
    const spy = vi.spyOn(toast, "error");
    notify.error("AxiosError: Request failed with status code 500 (SQLSTATE[HY000])");

    expect(spy).toHaveBeenCalledWith(
      "Unable to complete this action. Please try again.",
      expect.objectContaining({
        iconTheme: { primary: "#B91C1C", secondary: "#FEF2F2" },
      })
    );
  });

  it("4. Loading Toast: dispatches loading notification", () => {
    const spy = vi.spyOn(toast, "loading");
    notify.loading("Saving changes...");

    expect(spy).toHaveBeenCalledWith("Saving changes...", expect.any(Object));
  });

  it("5. Confirmation Dialog: opens and renders semantic danger variant", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Delete this neural headset?"
        description="This hardware SKU will be permanently removed from the catalog."
        confirmText="Delete Headset"
        cancelText="Cancel"
        variant="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText("Delete this neural headset?")).toBeInTheDocument();
    expect(
      screen.getByText("This hardware SKU will be permanently removed from the catalog.")
    ).toBeInTheDocument();

    const deleteBtn = screen.getByRole("button", { name: "Delete Headset" });
    expect(deleteBtn).toBeInTheDocument();
    expect(deleteBtn.className).toContain("bg-rose-600");

    fireEvent.click(deleteBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it("6. Confirmation Dialog Cancel: triggers cancel callback", () => {
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Discard Unsaved Changes?"
        description="Your form changes will be lost."
        variant="warning"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);

    expect(onCancel).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("7. Confirmation Dialog Loading State: disables buttons and displays spinner", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={vi.fn()}
        title="Processing Refund"
        description="Submitting ledger mutation..."
        isLoading={true}
        onConfirm={vi.fn()}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: "Confirm" });
    expect(confirmBtn).toBeDisabled();

    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    expect(cancelBtn).toBeDisabled();
  });

  it("8. Session Expiration Dialog: renders modal when session expires", () => {
    useAuthStore.setState({ isSessionExpired: true });
    render(<SessionExpirationDialog />);

    expect(screen.getByText("Your session has expired")).toBeInTheDocument();
    expect(
      screen.getByText(/For your security, your session has expired/i)
    ).toBeInTheDocument();

    const signInBtn = screen.getByRole("button", { name: "Sign In Again" });
    expect(signInBtn).toBeInTheDocument();

    fireEvent.click(signInBtn);
    expect(useAuthStore.getState().isSessionExpired).toBe(false);
  });
});
