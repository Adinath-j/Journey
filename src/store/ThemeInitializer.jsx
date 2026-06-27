import { useEffect } from "react";
import { useThemeStore } from "./useThemeStore";

const accentPalettes = {
  violet: {
    300: "#c4b5fd",
    400: "#a78bfa",
    500: "#8b5cf6",
    600: "#7c3aed",
  },
  emerald: {
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981",
    600: "#059669",
  },
  rose: {
    300: "#fda4af",
    400: "#fb7185",
    500: "#f43f5e",
    600: "#e11d48",
  },
  blue: {
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
  },
  amber: {
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
  },
};

const themePalettes = {
  dark: {
    bg: "#020612",
    panel: "rgba(19, 30, 57, .5)",
  },
  midnight: {
    bg: "#000000",
    panel: "rgba(10, 10, 10, .8)",
  },
  light: {
    bg: "#f8fafc",
    panel: "rgba(255, 255, 255, .8)",
  },
};

export function ThemeInitializer() {
  const { theme, accentColor, focusMode } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    const palette = accentPalettes[accentColor] || accentPalettes.violet;
    
    // Override violet with chosen accent color
    root.style.setProperty("--color-violet-300", palette[300]);
    root.style.setProperty("--color-violet-400", palette[400]);
    root.style.setProperty("--color-violet-500", palette[500]);
    root.style.setProperty("--color-violet-600", palette[600]);

    // Handle background themes
    const t = themePalettes[theme] || themePalettes.dark;
    if (theme === "light") {
      root.style.setProperty("color-scheme", "light");
      root.classList.add("light-mode");
    } else {
      root.style.setProperty("color-scheme", "dark");
      root.classList.remove("light-mode");
      if (theme === "midnight") {
        root.style.setProperty("background", "#000000");
      } else {
        root.style.setProperty("background", "#020612");
      }
    }

    if (focusMode) {
      document.body.classList.add("focus-mode");
    } else {
      document.body.classList.remove("focus-mode");
    }
  }, [theme, accentColor, focusMode]);

  return null;
}
