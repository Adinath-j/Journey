import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "dark", // "dark", "light", "midnight"
      accentColor: "violet", // "violet", "emerald", "rose", "blue", "amber"
      focusMode: false,
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
    }),
    {
      name: "journey-theme-storage",
    }
  )
);
