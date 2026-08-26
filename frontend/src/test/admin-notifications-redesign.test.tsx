import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { useNotificationStore } from "@/stores/notification-store";

describe("Admin Notification Center & Operational Communication Suite (STEP 27.17)", () => {
  beforeEach(() => {
    useNotificationStore.setState({
      unreadCount: 0,
      isOpen: false,
    });
  });

  it("1. Notification Bell: renders accessible trigger without badge when unreadCount is 0", () => {
    render(<NotificationMenu />);

    const bellButton = screen.getByRole("button", { name: /notifications/i });
    expect(bellButton).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("2. Unread Count Badge: displays authoritative badge when unreadCount > 0", () => {
    useNotificationStore.setState({ unreadCount: 4 });
    render(<NotificationMenu />);

    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("3. Dropdown Panel: opens on click, renders notifications, and executes Mark All Read", () => {
    useNotificationStore.setState({ unreadCount: 2 });
    render(<NotificationMenu />);

    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);

    expect(screen.getByText("Order Dispatched")).toBeInTheDocument();
    expect(screen.getByText("Security Ledger Updated")).toBeInTheDocument();
    expect(screen.getByText("Mark all read")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Mark all read"));
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });

  it("4. Empty State: renders empty notice when unreadCount is 0", () => {
    useNotificationStore.setState({ unreadCount: 0 });
    render(<NotificationMenu />);

    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);

    expect(screen.getByText("You're all caught up")).toBeInTheDocument();
    expect(screen.getByText("No new notifications")).toBeInTheDocument();
  });

  it("5. Keyboard Accessibility: closes dropdown on Escape key press", () => {
    useNotificationStore.setState({ unreadCount: 3 });
    render(<NotificationMenu />);

    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);
    expect(screen.getByText("Mark all read")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Mark all read")).not.toBeInTheDocument();
  });
});
