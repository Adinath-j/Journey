import { BookOpen, CheckCircle2, Circle, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SectionTitle } from "@/components/common/SectionTitle";

export function CurrentTopicCard({ currentTopic }) {
  if (!currentTopic) {
    return (
      <GlassCard className="p-5 flex flex-col h-full">
        <SectionTitle icon={BookOpen}>Current Topic</SectionTitle>
        <div className="flex-1 grid place-items-center text-sm text-slate-500">No active topic selected.</div>
      </GlassCard>
    );
  }

  const { title, concepts = [], problems = [], resources = [], notes } = currentTopic;

  const renderChecklist = (items) => {
    if (!items || items.length === 0) return <p className="text-xs text-slate-500 italic">None specified</p>;
    return (
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs">
            {item.completed ? (
              <CheckCircle2 className="size-[14px] text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <Circle className="size-[14px] text-slate-600 shrink-0 mt-0.5" />
            )}
            <span className={item.completed ? "text-slate-400" : "text-slate-200"}>{item.title}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <GlassCard className="p-5 flex flex-col h-full">
      <SectionTitle icon={BookOpen}>Current Topic</SectionTitle>
      
      <div className="mt-4 mb-5">
        <h2 className="text-xl font-semibold text-slate-100">{title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-slate-500 mb-3">Concepts</h3>
          {renderChecklist(concepts)}
        </div>
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-slate-500 mb-3">Problems</h3>
          {renderChecklist(problems)}
        </div>
        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-slate-500 mb-3">Resources</h3>
          {(!resources || resources.length === 0) ? (
            <p className="text-xs text-slate-500 italic">No resources linked</p>
          ) : (
            <ul className="space-y-2">
              {resources.map((res, idx) => (
                <li key={idx} className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors">
                  <a href={res.url} target="_blank" rel="noreferrer" className="truncate">{res.title}</a>
                  <ExternalLink className="size-3 shrink-0" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {notes && (
        <div className="mt-auto pt-4 border-t border-white/5">
          <h3 className="text-[11px] uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Notes
          </h3>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{notes}</p>
        </div>
      )}
    </GlassCard>
  );
}
