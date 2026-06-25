import { create } from "zustand";

export const useAppStore = create((set) => ({
  activePage: "dashboard",
  setActivePage: (activePage) => set({ activePage }),
}));
