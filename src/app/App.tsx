import { lazy, Suspense } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppShell } from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";

const pages = {
  dashboard: lazy(() => import("@/pages/Dashboard/Dashboard")),
  heatmap: lazy(() => import("@/pages/Heatmap/Heatmap")),
  roadmap: lazy(() => import("@/pages/Roadmap/Roadmap")),
  log: lazy(() => import("@/pages/Log/Log")),
};

export function App() {
  const activePage = useAppStore((state) => state.activePage);
  const ActivePage = pages[activePage];
  return (
    <AppShell>
      <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-sm text-slate-400">Opening your journey…</div>}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={activePage} initial={{ opacity: 0, scale: 0.995 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            <ActivePage />
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </AppShell>
  );
}
