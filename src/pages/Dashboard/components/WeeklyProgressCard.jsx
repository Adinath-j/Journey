import { TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function WeeklyProgressCard({ weeklyProgress }) {
  if (!weeklyProgress) return null;

  const { hoursStudied, goalHours, topicsCompleted, goalTopics } = weeklyProgress;
  const hoursProgress = Math.min(100, Math.round((hoursStudied / goalHours) * 100));

  return (
    <GlassCard className="p-5 flex flex-col justify-between">
      <div className="flex items-center gap-2 text-slate-200 mb-6">
        <TrendingUp className="size-4 text-violet-400" />
        <h3 className="text-sm font-medium">This Week</h3>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <div className="flex gap-1.5 h-3">
            {/* Split progress bar into 10 segments */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div 
                key={i} 
                className={`w-8 h-2 rounded-sm ${i < (hoursProgress / 10) ? "bg-violet-500" : "bg-white/5"}`} 
              />
            ))}
          </div>
          <span className="text-sm"><span className="text-white font-medium">{hoursStudied}</span><span className="text-slate-400"> / {goalHours} hrs</span></span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Hours Studied</p>
          <p className="text-xl text-slate-200">{hoursStudied} <span className="text-sm text-slate-500">hrs</span></p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Topics Completed</p>
          <p className="text-xl text-emerald-400">{topicsCompleted} <span className="text-sm text-slate-500">/ {goalTopics}</span></p>
        </div>
      </div>
    </GlassCard>
  );
}
