import { motion } from "motion/react";
import { MoonStar, X } from "lucide-react";
import { navigationItems } from "@/constants/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";

export function TopNavigation() {
  const activePage = useAppStore((state) => state.activePage);
  const setActivePage = useAppStore((state) => state.setActivePage);

  return (
    <header className="window-header relative flex h-[70px] items-center justify-center border-b border-white/[0.07] px-7" data-tauri-drag-region>
      <nav className="glass-nav flex items-center rounded-2xl p-1" aria-label="Primary navigation">
        {navigationItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button key={item.id} onClick={() => setActivePage(item.id)} className={`relative w-[112px] rounded-xl py-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/80 ${isActive ? "text-white" : "text-slate-300 hover:text-white"}`} aria-current={isActive ? "page" : undefined}>
              {isActive && <motion.span layoutId="active-nav" className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/25 to-violet-500/20 shadow-[inset_0_0_18px_rgba(99,102,241,.16)]" transition={{ type: "spring", stiffness: 420, damping: 35 }} />}
              <span className="relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="absolute right-6 flex items-center gap-1">
        <Button variant="ghost" className="size-9 p-0" aria-label="Theme settings"><MoonStar className="size-[19px]" /></Button>
        <span className="mx-1 h-4 w-px bg-white/10" />
        <Button variant="ghost" className="size-9 p-0" aria-label="Close window"><X className="size-5" /></Button>
      </div>
    </header>
  );
}
