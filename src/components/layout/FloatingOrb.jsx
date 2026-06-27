import { ProgressRing } from "@/components/ui/ProgressRing";
import { useDashboardStore } from "@/store/useDashboardStore";

export function FloatingOrb() {
  const hero = useDashboardStore((state) => state.hero);
  const progress = hero?.progress || 0;

  return (
    <aside className="orb-wrap fixed right-[2.3vw] top-[6vh] z-10 hidden flex-col items-center 2xl:flex" aria-label={`Journey progress: ${progress}%`}>
      <div className="orb relative grid size-[190px] place-items-center rounded-full">
        <ProgressRing value={progress} size="lg" showValue />
        <span className="absolute top-[120px] text-sm text-slate-200">My Journey</span>
        <span className="orb-satellite absolute right-2 top-1 size-7 rounded-full" />
      </div>
      <span className="mt-3 rounded-full border border-white/20 bg-slate-900/70 px-4 py-1.5 text-xs text-slate-200 shadow-lg backdrop-blur-xl">Click to open</span>
    </aside>
  );
}
