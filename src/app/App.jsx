import { lazy, Suspense, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppShell } from "@/components/layout/AppShell";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthOverlay } from "@/components/auth/AuthOverlay";
import { CommandPalette } from "@/components/ui/CommandPalette";

import StudyWorkspace from "@/pages/StudyWorkspace/StudyWorkspace";
import { ResumeSessionPrompt } from "@/components/workspace/ResumeSessionPrompt";

const pages = {
  dashboard: lazy(() => import("@/pages/Dashboard/Dashboard")),
  heatmap: lazy(() => import("@/pages/Heatmap/Heatmap")),
  roadmap: lazy(() => import("@/pages/Roadmap/Roadmap")),
  log: lazy(() => import("@/pages/Log/Log")),
  analytics: lazy(() => import("@/pages/Analytics/Analytics")),
  library: lazy(() => import("@/pages/Library/Library")),
};

export function App() {
  const activePage = useAppStore((state) => state.activePage);
  const ActivePage = pages[activePage];
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      {!isAuthenticated && <AuthOverlay />}
      <AppShell>
        <Suspense fallback={<div className="grid min-h-[60vh] place-items-center text-sm text-slate-400">Opening your journey…</div>}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={activePage} initial={{ opacity: 0, scale: 0.995 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <ActivePage />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </AppShell>
      <StudyWorkspace />
      <ResumeSessionPrompt />
      <CommandPalette />
    </>
  );
}
