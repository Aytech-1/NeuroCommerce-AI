import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationMenu } from "@/components/layout/notification-menu";
import { useNotificationStore } from "@/stores/notification-store";

describe("NotificationMenu Component", () => {
  beforeEach(() => {
    useNotificationStore.setState({
      unreadCount: 0,
      isOpen: false,
    });
  });

  it("renders notification bell with no badge when unreadCount is 0", () => {
    render(<NotificationMenu />);
    const bellButton = screen.getByRole("button", { name: /notifications/i });
    expect(bellButton).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("displays unread counter badge when unreadCount > 0", () => {
    useNotificationStore.setState({ unreadCount: 5 });
    render(<NotificationMenu />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("opens dropdown panel on click and clears unread notifications when mark read is clicked", () => {
    useNotificationStore.setState({ unreadCount: 3 });
    render(<NotificationMenu />);

    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);

    expect(screen.getByText("Mark all read")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Mark all read"));
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });
});
