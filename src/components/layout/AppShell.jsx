import { FloatingOrb } from "@/components/layout/FloatingOrb";
import { TopNavigation } from "@/components/layout/TopNavigation";

export function AppShell({ children }) {
  return (
    <div className="app-background min-h-screen overflow-x-hidden p-[2.6vh_2.5vw] text-slate-100">
      <div className="window-shell relative min-h-[calc(100vh-5.2vh)] overflow-hidden rounded-[25px] 2xl:mr-[19vw]">
        <TopNavigation />
        {children}
      </div>
      <FloatingOrb />
    </div>
  );
}
