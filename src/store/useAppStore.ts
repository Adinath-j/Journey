import { create } from "zustand";
import type { PageId } from "@/types/navigation";

interface AppState {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activePage: "dashboard",
  setActivePage: (activePage) => set({ activePage }),
}));
