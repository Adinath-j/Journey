import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Settings, X, LogOut } from "lucide-react";
import { navigationItems } from "@/constants/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Button } from "@/components/ui/Button";
import { SettingsModal } from "./SettingsModal";
import { toast } from "sonner";

export function TopNavigation() {
  const activePage = useAppStore((state) => state.activePage);
  const setActivePage = useAppStore((state) => state.setActivePage);
  const { focusMode, toggleFocusMode } = useThemeStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleFocusMode();
        toast(focusMode ? "Exited Focus Mode" : "Entered Focus Mode (Press 'F' to exit)", { icon: "🧘" });
      }
      if (e.key === "Escape") {
        setIsSettingsOpen(false);
        if (useThemeStore.getState().focusMode) {
          useThemeStore.getState().toggleFocusMode();
          toast("Exited Focus Mode");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusMode, toggleFocusMode]);

  if (focusMode) return null; // Hide navigation in Focus Mode

  return (
    <>
      <header className="window-header relative flex h-[70px] shrink-0 items-center justify-center border-b border-white/[0.07] px-7" data-tauri-drag-region>
        <nav className="glass-nav flex items-center rounded-2xl p-1" aria-label="Primary navigation">
          {navigationItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button key={item.id} onClick={() => setActivePage(item.id)} className={`relative w-[112px] rounded-xl py-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/80 ${isActive ? "text-white" : "text-slate-300 hover:text-white"}`} aria-current={isActive ? "page" : undefined}>
                {isActive && <motion.span layoutId="active-nav" className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-500/25 to-violet-500/20 shadow-[inset_0_0_18px_rgba(139,92,246,.16)]" transition={{ type: "spring", stiffness: 420, damping: 35 }} />}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="absolute right-6 flex items-center gap-1">
          <Button variant="ghost" className="size-9 p-0" aria-label="Settings" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="size-[19px]" />
          </Button>
          <Button variant="ghost" className="size-9 p-0 text-slate-400 hover:text-red-400" aria-label="Log out" onClick={() => useAuthStore.getState().logout()}>
            <LogOut className="size-[17px]" />
          </Button>
          <span className="mx-1 h-4 w-px bg-white/10" />
          <Button 
            variant="ghost" 
            className="size-9 p-0 hover:bg-red-500/20 hover:text-red-400" 
            aria-label="Close window"
            onClick={() => {
              if (window.__TAURI__) {
                window.__TAURI__.window.appWindow.close();
              } else {
                toast("Tauri environment not detected (Running in browser)");
              }
            }}
          >
            <X className="size-5" />
          </Button>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
