import { CalendarCheck2, Circle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/common/SectionTitle";
import { useAppStore } from "@/store/useAppStore";

export function TodaysPlanCard({ todaysPlan }) {
  const setActivePage = useAppStore(state => state.setActivePage);

  if (!todaysPlan || todaysPlan.length === 0) {
    return (
      <GlassCard className="p-5 flex flex-col h-full">
        <SectionTitle icon={CalendarCheck2}>Today&apos;s Plan</SectionTitle>
        <div className="flex-1 grid place-items-center text-sm text-slate-500 text-center py-8">
          <div>
            <p className="mb-4">No active topic selected.<br/>Choose a roadmap topic to generate a plan.</p>
            <button onClick={() => setActivePage('roadmap')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors">Open Roadmap</button>
          </div>
        </div>
      </GlassCard>
    );
  }

  // Calculate total time
  const totalHours = todaysPlan.reduce((acc, curr) => {
    const hrs = parseFloat(curr.duration);
    return acc + (isNaN(hrs) ? 1 : hrs); // fallback to 1h if parsing fails
  }, 0);

  return (
    <GlassCard className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <SectionTitle icon={CalendarCheck2}>Today&apos;s Plan</SectionTitle>
        <button className="text-[11px] text-slate-400 hover:text-white transition-colors">View All</button>
      </div>
      
      <div className="flex-1 space-y-4">
        {todaysPlan.map((item, idx) => (
          <div key={item.id} className="flex flex-col gap-1 group">
            <div className="flex items-center gap-3">
              <Circle className="size-[18px] text-slate-600 shrink-0 group-hover:text-violet-400 transition-colors" />
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span className="text-sm truncate text-slate-200">
                  {item.title}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 whitespace-nowrap">
                  {item.priorityScore} Pts
                </span>
              </div>
              <span className="text-xs shrink-0 text-slate-400">
                {item.duration}
              </span>
            </div>
            <div className="pl-7 text-[10px] text-slate-500 flex items-center gap-2">
              <span className="text-emerald-500/80 uppercase tracking-wider">{item.reason}</span>
              {item.subtitle && <span>• {item.subtitle}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <span>Estimated Time</span>
        <span className="text-slate-300">~ {totalHours.toFixed(1)} hrs</span>
      </div>
    </GlassCard>
  );
}
