import { GitCommitHorizontal } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/common/SectionTitle";

export function LearningTimelineCard({ timeline }) {
  const formatDateHeader = (dateStr) => {
    const d = new Date(dateStr);
    if (d.toDateString() === new Date().toDateString()) return "Today";
    if (d.toDateString() === new Date(Date.now() - 86400000).toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "short" });
  };

  return (
    <GlassCard className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <SectionTitle icon={GitCommitHorizontal}>Learning Timeline</SectionTitle>
        <button className="text-[11px] text-slate-400 hover:text-white transition-colors">View All</button>
      </div>

      <div className="flex-1 relative">
        <div className="absolute left-2.5 top-2 bottom-0 w-px bg-white/10" />
        
        <div className="space-y-6">
          {timeline.length === 0 ? (
            <p className="text-sm text-slate-500 pl-8">No timeline events yet.</p>
          ) : (
            timeline.slice(0, 5).map((group) => (
              <div key={group.date} className="relative pl-8">
                <div className="absolute left-[7px] top-1.5 size-2 rounded-full bg-violet-500 ring-4 ring-[#0b1120]" />
                <h4 className="text-xs text-slate-300 mb-3">{formatDateHeader(group.date)}</h4>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <div key={item.id}>
                      <p className="text-sm text-slate-200">{item.title}</p>
                      {item.details && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.details}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassCard>
  );
}
