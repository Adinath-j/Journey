import { BookOpen, Clock3 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { GlassCard } from "@/components/ui/GlassCard";
import { studyLog } from "@/data/mock/log";

export default function Log() {
  return <PageContainer><div className="page-heading"><BookOpen /><div><h1>Study log</h1><p>The work adds up. Here is the proof.</p></div></div><div className="mt-8 space-y-3">{studyLog.map((entry) => <GlassCard key={`${entry.date}-${entry.title}`} interactive className="flex items-center gap-5 p-5"><span className="w-20 text-xs text-slate-400">{entry.date}</span><div className="flex-1"><h2 className="text-sm font-medium">{entry.title}</h2><span className="mt-1 inline-block text-[10px] uppercase tracking-widest text-violet-300">{entry.category}</span></div><span className="flex items-center gap-2 text-xs text-slate-300"><Clock3 className="size-4" />{entry.duration}</span></GlassCard>)}</div></PageContainer>;
}
