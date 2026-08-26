import { create } from "zustand";

interface NotificationState {
  unreadCount: number;
  isOpen: boolean;
  setUnreadCount: (count: number) => void;
  decrementUnread: () => void;
  clearUnread: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
  toggleNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  isOpen: false,

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  clearUnread: () => set({ unreadCount: 0 }),
  openNotifications: () => set({ isOpen: true }),
  closeNotifications: () => set({ isOpen: false }),
  toggleNotifications: () => set((state) => ({ isOpen: !state.isOpen })),
}));
