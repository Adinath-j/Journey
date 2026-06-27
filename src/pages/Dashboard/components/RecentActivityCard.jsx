import { Clock3, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/common/SectionTitle";

export function RecentActivityCard({ recentActivity }) {
  // Simple grouping for visual structure
  const grouped = recentActivity.reduce((acc, log) => {
    const d = new Date(log.date);
    let key = "Older";
    if (d.toDateString() === new Date().toDateString()) key = "Today";
    else if (d.toDateString() === new Date(Date.now() - 86400000).toDateString()) key = "Yesterday";
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {});

  const order = ["Today", "Yesterday", "Older"];

  return (
    <GlassCard className="p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <SectionTitle icon={Clock3}>Recent Activity</SectionTitle>
        <button className="text-[11px] text-slate-400 hover:text-white transition-colors">View All</button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        {order.map(group => {
          if (!grouped[group] || grouped[group].length === 0) return null;
          return (
            <div key={group}>
              <h4 className="text-[11px] text-slate-500 mb-3">{group}</h4>
              <ul className="space-y-3">
                {grouped[group].map(log => (
                  <li key={log.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-500/70" />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{log.title}</span>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {recentActivity.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
        )}
      </div>
    </GlassCard>
  );
}
