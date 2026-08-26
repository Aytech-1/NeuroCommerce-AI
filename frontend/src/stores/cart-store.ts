import { create } from "zustand";

interface CartState {
  itemCount: number;
  isOpen: boolean;
  sessionId: string | null;
  setItemCount: (count: number) => void;
  incrementCount: (delta?: number) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setSessionId: (id: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
  isOpen: false,
  sessionId: typeof window !== "undefined" ? localStorage.getItem("guest_session_id") : null,

  setItemCount: (count) => set({ itemCount: count }),
  incrementCount: (delta = 1) => set((state) => ({ itemCount: state.itemCount + delta })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setSessionId: (id) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("guest_session_id", id);
    }
    set({ sessionId: id });
  },
}));
