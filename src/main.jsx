import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { AppProviders } from "@/app/providers";
import { ThemeInitializer } from "@/store/ThemeInitializer";
import { Toaster } from "sonner";
import "@/styles/globals.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProviders>
      <ThemeInitializer />
      <Toaster theme="dark" position="bottom-right" />
      <App />
    </AppProviders>
  </StrictMode>,
);
