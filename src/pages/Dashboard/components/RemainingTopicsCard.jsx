import { Network, Circle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/common/SectionTitle";

export function RemainingTopicsCard({ remainingTopics }) {
  return (
    <GlassCard className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <SectionTitle icon={Network}>Remaining Topics</SectionTitle>
        <button className="text-[11px] text-slate-400 hover:text-white transition-colors">View All</button>
      </div>

      {(!remainingTopics || remainingTopics.length === 0) ? (
        <div className="flex-1 grid place-items-center text-sm text-slate-500 py-4">No remaining siblings or children.</div>
      ) : (
        <div className="flex-1 space-y-4">
          {remainingTopics.map((topic) => (
            <div key={topic.id} className="flex items-center gap-3">
              <Circle className="size-4 text-slate-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate">{topic.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500/50" style={{ width: `${topic.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 w-6">{topic.progress}%</span>
                </div>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{topic.duration}</span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
